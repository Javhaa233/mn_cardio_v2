/**
 * Route-level permission gate — mobile tender §1.2.
 *
 *   router.get('/visits', gate, requirePermission('Visit', 'read'), c.listVisits)
 *
 * All of the reasoning lives in helper/Permissions.js; this is the middleware
 * around it. Three things it does that are worth stating here:
 *
 * IT IS INERT BY DEFAULT. FEATURE_PERMISSIONS is 'off', so attaching this to a
 * route changes nothing until somebody deliberately turns it on. That is what
 * makes it safe to wire into every route in one commit.
 *
 * IN 'warn' IT LOGS AND ALLOWS. The log line is the deliverable: it names the
 * object, the action and the user for every request that WOULD have been
 * denied, which is how RoleToPermission gets seeded from evidence rather than
 * from somebody's guess about what doctors do all day. console.error, not
 * console.log, because server.js silences console.log in production and this
 * matters most there.
 *
 * IT NEVER THROWS. A permission system that 500s is worse than one that is off:
 * the failure mode of a broken gate must be an open gate, not a broken API. The
 * same rule helper/RequireAppBuild.js follows.
 */

const Permissions = require('./Permissions');

const ACTIONS = ['create', 'read', 'update', 'delete'];

const requirePermission = (ObjectName, Action) => {
  if (ACTIONS.indexOf(Action) === -1) {
    // A programming error, caught at require time rather than on the first
    // request that happens to hit this route.
    throw new Error('requirePermission: action must be one of ' + ACTIONS.join(', '));
  }

  return async (req, res, next) => {
    try {
      const verdict = await Permissions.May({
        LogedUser: req.LogedUser,
        Object: ObjectName,
        Action,
      });

      if (verdict.Allowed) return next();

      if (verdict.Mode === 'warn') {
        console.error(
          '[RequirePermission] WOULD DENY ' +
            ObjectName +
            '.' +
            Action +
            ' user=' +
            String(req.LogedUser && req.LogedUser.Id) +
            ' role=' +
            String(req.LogedUser && req.LogedUser.RoleId) +
            ' reason=' +
            verdict.Reason +
            ' -> allowed (warn mode)'
        );
        return next();
      }

      return res.status(403).json({
        success: false,
        code: 'PERMISSION_DENIED',
        message: 'Энэ үйлдлийг гүйцэтгэх эрхгүй байна',
        data: { object: ObjectName, action: Action },
      });
    } catch (ex) {
      console.error('[RequirePermission] ' + ex.message);
      return next();
    }
  };
};

module.exports = requirePermission;
module.exports.ACTIONS = ACTIONS;
