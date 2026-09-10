const jwt = require('jsonwebtoken');
const { Models, Op } = require('../config/DB');

// Simple in-memory cache for user data (reduces DB calls)
const userCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Patients live in PatientUsers and staff in Users; both are IDENTITY columns
// starting at 1, so ids collide across the tables. Every cache entry and every
// lookup must therefore be qualified by role.
const cacheKey = (roleId, userId) => String(roleId) + ':' + String(userId);

class Authorization {
  // Store only essential user data in JWT to keep token small
  login(user, callback) {
    // Clear cache for this user on login (ensures fresh data)
    userCache.delete(cacheKey(user.RoleId, user.Id));
    // Extract only essential fields for the JWT token
    const tokenPayload = {
      Id: user.Id,
      UserName: user.UserName,
      RoleId: user.RoleId,
      OrganizationId: user.Doctor?.OrganizationId || user.OrganizationId || null,
    };

    jwt.sign(
      { user: tokenPayload },
      process.env.JWT_PASS,
      { expiresIn: '36000s' },
      (err, token) => callback && callback(token)
    );
  }

  getUserData = (token, callback) => {
    jwt.verify(token, process.env.JWT_PASS, async (err, authData) => {
      if (err) {
        console.log('JWT verification error:', err.message);
        callback(null);
      } else {
        // Fetch full user data from database
        try {
          const fullUserData = await this.fetchFullUserData(authData.user.Id, authData.user.RoleId);
          callback({ user: fullUserData || authData.user });
        } catch (fetchErr) {
          console.log('Error fetching full user data:', fetchErr.message);
          callback(authData);
        }
      }
    });
  };

  // Fetch full user data including Doctor and Organization
  /**
   * Build a patient session.
   *
   * DECIDED 2026-09-08: patients will authenticate with ДАН and their data will
   * come from ХУР, with no password. ДАН asserts a citizen **registration
   * number**, and ХУР is keyed by the same, so the registration number - not a
   * PatientUsers row - is the durable identity.
   *
   * This resolver therefore accepts either, and is the single place the switch
   * lands. Nothing downstream cares: PatientScope and every /api/patient/*
   * handler read PatientId / PatRegNo / PatientUserId off the session and never
   * from the request, so the authentication mechanism can change without
   * touching a resource handler.
   *
   * PatientUserId is today's password login and is transitional.
   * PatRegNo is the path ДАН will use.
   */
  async resolvePatientSession({ PatientUserId, PatRegNo }) {
    let patientUser = null;

    if (PatientUserId) {
      patientUser = await Models.PatientUsers.findByPk(PatientUserId, { raw: true });
      if (!patientUser) return null;
    }

    const where = patientUser ? { user_id: patientUser.Id } : { p_registration: PatRegNo };
    if (!patientUser && !PatRegNo) return null;

    const Patient = await Models.Patient.findOne({
      where,
      attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
      raw: true,
    });

    // Under ДАН there may be no PatientUsers row at all; the citizen is known
    // by their registration number alone.
    if (!patientUser && !Patient) return null;

    const session = patientUser ? JSON.parse(JSON.stringify(patientUser)) : {};
    delete session.Password;
    delete session.PlainPassword;

    session.RoleId = 4;
    session.Patient = Patient || null;
    // Flattened for the scoping helpers, which must never read an id from the
    // request body.
    session.PatientUserId = patientUser ? patientUser.Id : null;
    session.PatientId = Patient ? Patient.id_data : null;
    session.PatRegNo = Patient ? Patient.p_registration : PatRegNo || null;

    return session;
  }

  async fetchFullUserData(userId, roleId) {
    // Check cache first
    const key = cacheKey(roleId, userId);
    const cached = userCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      // Patients are not in the Users table. This used to look every id up in
      // Users with RoleId != 4, which for a patient either found nothing - so
      // the request carried only the raw token payload, with no patient id to
      // scope by - or found the staff account that happened to share the id,
      // silently promoting the patient to that doctor for the whole request.
      if (String(roleId) === '4') {
        const patientData = await this.resolvePatientSession({ PatientUserId: userId });
        if (!patientData) {
          return null;
        }
        userCache.set(key, { data: patientData, timestamp: Date.now() });
        return patientData;
      }

      let userDatas = await Models.Users.findAllDetail({
        where: { Id: userId, RoleId: { [Op.not]: 4 } },
      });

      if (!userDatas || userDatas.length === 0) {
        return null;
      }

      const userData = JSON.parse(JSON.stringify(userDatas[0]));
      delete userData.Password;

      // Load doctor data if role != 4
      if (userData.RoleId + '' !== '4') {
        const Doctor = await Models.DoctorsProfile.findOne({
          where: { id: userData.Id },
          include: [
            {
              model: Models.Organization,
              as: 'Organization',
              include: [
                {
                  model: Models.DictProvinceCity,
                  as: 'DictProvinceCity',
                  attributes: ['id_data', 'name', 'date_creation'],
                },
                {
                  model: Models.DictSoumDistrict,
                  as: 'DictSoumDistrict',
                  attributes: ['id_data', 'name'],
                },
                {
                  model: Models.DictBagKhoroo,
                  as: 'DictBagKhoroo',
                  attributes: ['id_data', 'name'],
                },
              ],
            },
          ],
          attributes: [
            'id_data',
            'lastname',
            'firstname',
            'email',
            'skype',
            'OrganizationId',
            'addr_prov_city',
            'ProvCityName',
            'addr_soum_dist',
            'SoumDistName',
            'addr_bag_khoroo',
            'BagKhorooName',
            'FullName',
          ],
        });

        if (Doctor) {
          userData.Doctor = JSON.parse(JSON.stringify(Doctor));
        }
      }

      // Cache the result
      userCache.set(key, { data: userData, timestamp: Date.now() });

      return userData;
    } catch (err) {
      console.log('Error in fetchFullUserData:', err.message);
      return null;
    }
  }

  verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    const errorObject = {
      Success: false,
      Message: 'There is a user who is not logged into the system',
      AuthError: true,
    };

    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;

      const isDev = process.env.NODE_ENV === 'development';

      const handleAuthData = async (authData) => {
        try {
          const fullUserData = await this.fetchFullUserData(authData.user.Id, authData.user.RoleId);
          req.LogedUser = fullUserData || authData.user;
        } catch (fetchErr) {
          console.log('Error fetching user data in verifyToken:', fetchErr.message);
          req.LogedUser = authData.user;
        }
        console.log({ reqUser: req.LogedUser.UserName });
        console.log('auth next request');
        next();
      };

      if (isDev) {
        // In development mode, decode token without verifying signature
        const decoded = jwt.decode(req.token);
        if (decoded && decoded.user) {
          console.log('[DEV] Skipping JWT signature verification');
          await handleAuthData(decoded);
        } else {
          req.LogedUser = null;
          console.log({ 'auth error': errorObject });
          return res.send(errorObject);
        }
      } else {
        jwt.verify(req.token, process.env.JWT_PASS, async (err, authData) => {
          if (err) {
            if (err.name === 'JsonWebTokenError') {
              console.log('Invalid token signature or wrong JWT password');
            } else if (err.name === 'TokenExpiredError') {
              console.log('Token has expired');
            } else if (err.name === 'NotBeforeError') {
              console.log('Token not active yet');
            }
            req.LogedUser = null;
            console.log({ 'auth error': errorObject });
            return res.send(errorObject);
          } else {
            await handleAuthData(authData);
          }
        });
      }
    } else {
      req.LogedUser = null;
      console.log({ 'auth error': errorObject });
      return res.send(errorObject);
    }
  };
}

module.exports = new Authorization();
