const PatientScope = require('./PatientScope');

/**
 * Gate for /api/patient/*.
 *
 * Asserts the caller is a patient (RoleId 4) whose session resolved to a real
 * Patient row, and hands the handlers the identifiers to scope by. Those come
 * from helper/Auth.js, which loads them from PatientUsers + Patient at token
 * verification time — never from the request.
 *
 * Handlers under this middleware must read req.Patient and must not accept a
 * patient identifier in the body or query. That is the whole point of the
 * surface: the mobile app cannot ask for someone else's data because there is
 * nowhere to put the request.
 */
const requirePatient = (req, res, next) => {
  const LogedUser = req.LogedUser;

  if (!PatientScope.IsPatient(LogedUser)) {
    return res.status(403).json({
      success: false,
      code: 'NOT_A_PATIENT',
      message: 'Хандах эрхгүй байна',
      data: null,
    });
  }

  // A patient account with no linked Patient row cannot be scoped, so refuse
  // rather than run an unfiltered query.
  if (!LogedUser.PatientId) {
    return res.status(403).json({
      success: false,
      code: 'PATIENT_NOT_RESOLVED',
      message: 'Таны бүртгэл олдсонгүй',
      data: null,
    });
  }

  req.Patient = {
    PatientId: LogedUser.PatientId,
    PatientUserId: LogedUser.PatientUserId,
    PatRegNo: LogedUser.PatRegNo,
  };

  return next();
};

module.exports = requirePatient;
