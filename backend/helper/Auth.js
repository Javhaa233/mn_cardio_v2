const jwt = require('jsonwebtoken');
const { Models, Op } = require('../config/DB');
const Flags = require('./FeatureFlags');
const SessionStore = require('./SessionStore');

// Simple in-memory cache for user data (reduces DB calls)
const userCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Patients live in PatientUsers and staff in Users; both are IDENTITY columns
// starting at 1, so ids collide across the tables. Every cache entry and every
// lookup must therefore be qualified by role.
const cacheKey = (roleId, userId) => String(roleId) + ':' + String(userId);

class Authorization {
  // Store only essential user data in JWT to keep token small
  login(user, callback, req) {
    // Clear cache for this user on login (ensures fresh data)
    userCache.delete(cacheKey(user.RoleId, user.Id));
    // Extract only essential fields for the JWT token
    const tokenPayload = {
      Id: user.Id,
      UserName: user.UserName,
      RoleId: user.RoleId,
      OrganizationId: user.Doctor?.OrganizationId || user.OrganizationId || null,
    };

    /*
     * jti - a token id, so ONE session can be cancelled.
     *
     * Without it, revoking a session meant rotating JWT_PASS and logging
     * everyone out, and LogOut was a stub: a stolen phone could not be cut off.
     *
     * Always minted, even when revocation is disabled. It costs nothing, and it
     * means that when the feature IS turned on, tokens issued from that moment
     * are already revocable - rather than having to wait ten hours for the
     * jti-less ones to drain.
     */
    const jti = SessionStore.NewJti();

    jwt.sign(
      { user: tokenPayload, jti },
      process.env.JWT_PASS,
      { expiresIn: '36000s' },
      (err, token) => {
        // Best-effort and not awaited: recording a session must never delay or
        // fail a login. SessionStore swallows its own errors.
        SessionStore.Record({
          UserType: String(user.RoleId) === '4' ? 'patient' : 'staff',
          UserId: user.Id,
          Jti: jti,
          ExpiresInSec: Authorization.ACCESS_TTL_SECONDS,
          Req: req,
        });
        return callback && callback(token);
      }
    );
  }

  // Drop one user's cached request data, so a change to their own account is
  // visible on the next request instead of up to CACHE_TTL later.
  clearUserCache(roleId, userId) {
    userCache.delete(cacheKey(roleId, userId));
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
            'telephone',
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

      // NODE_ENV alone is not enough. A host that comes up without NODE_ENV
      // set is not 'development', but one that comes up WITH it - a test box
      // someone copied a dev .env onto - used to accept any unsigned token.
      // The second condition defaults to false, so the bypass is now something
      // a developer opts into rather than something a deployment can fall into.
      const isDev = process.env.NODE_ENV === 'development' && Flags.AllowInsecureDevAuth;

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
            /*
             * A signature-valid token can still have been cancelled - a logout,
             * a lost phone, an administrator ending a session. IsRevoked is
             * synchronous against an in-memory set and costs nothing per
             * request; see helper/SessionStore.js for why it is not a query.
             *
             * Returns false for everything while TOKEN_REVOCATION_ENABLED is
             * off, which is the default.
             */
            if (SessionStore.IsRevoked(authData.jti)) {
              req.LogedUser = null;
              console.log({ 'auth error': 'token revoked' });
              return res.send(errorObject);
            }
            // Carried so LogOut can revoke exactly this session without the
            // caller having to send anything identifying it.
            req.TokenJti = authData.jti || null;
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

  /* --------------------------------------------------------------- refresh */

  /**
   * Refresh tokens.
   *
   * The access token lives 10 hours and LogOut invalidates nothing, so before
   * this a doctor was thrown out mid-shift and a phone had to hold the password
   * to get back in. That is the problem this solves.
   *
   * A refresh token is a JWT signed with the same secret and marked `typ:
   * 'refresh'`, so it cannot be presented as an access token: verifyToken reads
   * `decoded.user` and a refresh token has none. The reverse is checked
   * explicitly below.
   *
   * There is no server-side store, so a refresh token cannot be revoked
   * individually - rotating JWT_PASS invalidates all of them, which is exactly
   * the position access tokens are already in. Adding real revocation needs a
   * table, and therefore DDL (CLAUDE.md §2); it is written up in
   * mobile/READINESS.md rather than half-built here.
   */
  static REFRESH_TTL = '30d';
  static ACCESS_TTL_SECONDS = 36000;

  issueRefreshToken(user, callback) {
    jwt.sign(
      {
        typ: 'refresh',
        Id: user.Id,
        RoleId: user.RoleId,
      },
      process.env.JWT_PASS,
      { expiresIn: Authorization.REFRESH_TTL },
      (err, token) => callback && callback(err ? null : token)
    );
  }

  /** Resolves to { Id, RoleId } or null. Never throws. */
  verifyRefreshToken(token) {
    return new Promise((resolve) => {
      if (!token) return resolve(null);
      jwt.verify(token, process.env.JWT_PASS, (err, decoded) => {
        if (err || !decoded) {
          console.log('refresh token rejected:', err ? err.message : 'empty');
          return resolve(null);
        }
        // An access token must not be usable as a refresh token: it carries a
        // `user` claim and no `typ`, and accepting it would turn a 10-hour
        // token into a 30-day one.
        if (decoded.typ !== 'refresh' || !decoded.Id) return resolve(null);
        resolve({ Id: decoded.Id, RoleId: decoded.RoleId });
      });
    });
  }

  /**
   * Issue a fresh access token for an already-authenticated identity.
   *
   * Re-reads the user from the database rather than trusting the old token, so
   * a deactivated account or a changed role takes effect at the next refresh
   * instead of persisting for the life of the token.
   */
  async reissue({ Id, RoleId }) {
    userCache.delete(cacheKey(RoleId, Id));
    const fullUser = await this.fetchFullUserData(Id, RoleId);
    if (!fullUser) return null;

    const token = await new Promise((resolve) =>
      this.login(fullUser, (t) => resolve(t))
    );
    if (!token) return null;

    const refreshToken = await new Promise((resolve) =>
      this.issueRefreshToken(fullUser, (t) => resolve(t))
    );

    return {
      token,
      refreshToken,
      expiresIn: Authorization.ACCESS_TTL_SECONDS,
      LogedUser: fullUser,
    };
  }
}

module.exports = new Authorization();
