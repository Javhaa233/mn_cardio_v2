/**
 * Gate for /api/doctor/*.
 *
 * The mirror of helper/RequirePatient.js, and it works the same way: it asserts
 * the caller is staff, resolves the identifiers the handlers scope by, and puts
 * them on req.Doctor. Handlers must read req.Doctor and must never accept a
 * doctor, user or organisation identifier from the request — that is what stops
 * one doctor reading another's caseload by editing a request body.
 *
 * Roles (CLAUDE.md §3 — no enum exists anywhere else):
 *   1 admin · 2, 3 doctor tiers · 4 patient · 5 profile-only · 6 settings/admin
 *
 * 4 is refused outright: patients have their own surface. 5 is refused because a
 * profile-only account has no caseload to show.
 *
 * OrganizationId comes from LogedUser.Doctor when the full user loaded, and from
 * the flat JWT payload on the degraded path where Auth.fetchFullUserData failed.
 * Reading both matters: BaseControllerHelper does the same, and a null here
 * would widen an organisation-scoped query rather than narrow it.
 */
const DOCTOR_ROLES = ['1', '2', '3', '6'];

const requireDoctor = (req, res, next) => {
  const LogedUser = req.LogedUser;

  if (!LogedUser || !LogedUser.RoleId) {
    return res.status(401).json({
      success: false,
      code: 'NOT_AUTHENTICATED',
      message: 'Нэвтэрнэ үү',
      data: null,
    });
  }

  const RoleId = String(LogedUser.RoleId);

  if (RoleId === '4') {
    return res.status(403).json({
      success: false,
      code: 'NOT_A_DOCTOR',
      message: 'Хандах эрхгүй байна',
      data: null,
    });
  }

  if (DOCTOR_ROLES.indexOf(RoleId) === -1) {
    return res.status(403).json({
      success: false,
      code: 'ROLE_NOT_ALLOWED',
      message: 'Хандах эрхгүй байна',
      data: null,
    });
  }

  const Doctor = LogedUser.Doctor || null;
  const OrganizationId =
    (Doctor ? Doctor.OrganizationId : null) || LogedUser.OrganizationId || null;

  // An admin legitimately has no organisation and is scoped by role instead.
  // Everyone else without one cannot be scoped, so refuse rather than run a
  // query that would return the whole country.
  if (RoleId !== '1' && !OrganizationId) {
    return res.status(403).json({
      success: false,
      code: 'ORGANIZATION_NOT_RESOLVED',
      message: 'Таны байгууллагын мэдээлэл олдсонгүй',
      data: null,
    });
  }

  req.Doctor = {
    UserId: LogedUser.Id,
    DoctorId: Doctor ? Doctor.id_data : null,
    OrganizationId,
    RoleId,
    IsAdmin: RoleId === '1',
    FullName: Doctor ? Doctor.FullName : LogedUser.UserName,
  };

  return next();
};

module.exports = requireDoctor;
