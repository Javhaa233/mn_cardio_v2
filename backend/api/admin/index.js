const express = require('express');
const c = require('./controller');

/**
 * /api/admin/* — operational endpoints for roles 1 and 6.
 *
 * Gated by VerifyTokenJson plus a role check written here rather than in a
 * helper: RequireDoctor admits roles 1, 2, 3 and 6, and this surface is for the
 * administrator and settings tiers only. One route does not justify a fifth
 * gate helper, but it does justify saying why it is not RequireDoctor.
 */
const router = express.Router();

const ADMIN_ROLES = ['1', '6'];

const requireAdmin = (req, res, next) => {
  const L = req.LogedUser;
  if (!L || !L.RoleId) {
    return res.status(401).json({
      success: false,
      code: 'NOT_AUTHENTICATED',
      message: 'Нэвтэрнэ үү',
      data: null,
    });
  }
  if (ADMIN_ROLES.indexOf(String(L.RoleId)) === -1) {
    return res.status(403).json({
      success: false,
      code: 'ROLE_NOT_ALLOWED',
      message: 'Хандах эрхгүй байна',
      data: null,
    });
  }
  return next();
};

const gate = [require('../../helper/VerifyTokenJson'), requireAdmin];

// §1.3 Нөөцлөлт - recent backups and whether they actually worked
router.get('/backups', gate, c.listBackups);

module.exports = router;
