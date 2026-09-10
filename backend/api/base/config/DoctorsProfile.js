const {
  Models: { DoctorsProfile, Organization },
} = require('../../../config/DB');

// Add organization filter for non-admin users (show only doctors from own org + child orgs)
const addOrgFilter = async (req) => {
  const LogedUser = req.LogedUser;
  if (!LogedUser) return;

  const RoleId = parseInt(LogedUser.RoleId);
  // Admin (1) and SuperAdmin (6) can see all doctors
  if (RoleId === 1 || RoleId === 6) return;

  const OrganizationId = LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : null;
  if (!OrganizationId) return;

  // Get child organization IDs
  const orgIds = [OrganizationId];
  const ChildOrganizations = await Organization.findAll({
    where: { ParentOrganizationId: OrganizationId },
    attributes: ['Id'],
    raw: true,
  });
  if (ChildOrganizations && ChildOrganizations.length > 0) {
    ChildOrganizations.forEach((e) => orgIds.push(e.Id));
  }

  const orgFilter = ['OrganizationId', 'in', orgIds];

  if (req.filter) {
    req.filter = [req.filter, 'and', orgFilter];
  } else {
    req.filter = orgFilter;
  }
};

const list = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'id_data', desc: true }];
  await addOrgFilter(req);
  next();
};

const show = (req, res, next) => {
  next();
};

const lookup = async (req, res, next) => {
  await addOrgFilter(req);
  next();
};

module.exports = {
  model: DoctorsProfile,
  middleware: { show, list, lookup },
  validation: {},
};
