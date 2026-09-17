const {
  Models: { Organization },
  sequelize,
} = require('../../../config/DB');
const { format } = require('date-fns');

// Add organization filter for non-admin users (show only own org + child orgs)
const addOrgFilter = async (req) => {
  const LogedUser = req.LogedUser;
  if (!LogedUser) return;

  const RoleId = parseInt(LogedUser.RoleId);
  // Admin (1) and SuperAdmin (6) can see all organizations
  if (RoleId === 1 || RoleId === 6) return;

  const OrganizationId = LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : null;
  if (!OrganizationId) return;

  // Show user's own organization and its child organizations
  const orgFilter = [
    ['Id', '=', OrganizationId],
    'or',
    ['ParentOrganizationId', '=', OrganizationId],
  ];

  if (req.filter) {
    req.filter = [req.filter, 'and', orgFilter];
  } else {
    req.filter = orgFilter;
  }
};

const list = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'level', desc: true }];
  await addOrgFilter(req);
  next();
};

const show = (req, res, next) => {
  next();
};

// Organizations that were merged away stay in the table for audit, but must
// not be selectable anywhere new data gets attached.
const excludeMerged = (req) => {
  const activeFilter = ['IsActive', '=', 1];
  req.filter = req.filter ? [req.filter, 'and', activeFilter] : activeFilter;
};

const lookup = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'level', desc: true }];
  await addOrgFilter(req);
  excludeMerged(req);
  next();
};

const create = async (req, res, next) => {
  req.body.CreateUserId = req.LogedUser.Id;
  req.body.CreateDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  next();
};

const update = async (req, res, next) => {
  next();
};

module.exports = {
  model: Organization,
  middleware: { show, list, lookup, create, update },
  validation: {},
};
