/**
 * Refuses RoleId 4 (patients) in this surface's lowercase envelope.
 *
 * Why this exists separately from server.js's restrictPatientRoutes: that one
 * is driven by PATIENT_ALLOWED_PREFIXES, and it only runs on routes registered
 * through registerRoutes() - the 49 legacy prefixes. The /api/base and
 * /api/report mounts come from api/index.js and never pass through it, so a
 * patient token that reached them would gain a surface the legacy allowlist
 * deliberately withholds: /api/base alone exposes DoctorsProfile, Organization
 * and a dozen other targets through a generic REST resource API.
 *
 * Pair it with helper/VerifyTokenJson so an unauthenticated caller gets a real
 * 401 and an authenticated patient gets a real 403, both in the envelope these
 * mounts already speak.
 */
module.exports = function DenyPatient(req, res, next) {
  const LogedUser = req.LogedUser;

  if (LogedUser && String(LogedUser.RoleId) === '4') {
    return res.status(403).json({
      success: false,
      code: 'ROLE_NOT_ALLOWED',
      message: 'Хандах эрхгүй байна',
      data: null,
    });
  }

  return next();
};
