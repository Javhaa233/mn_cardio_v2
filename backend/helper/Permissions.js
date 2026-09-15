/**
 * Per-user permissions — mobile tender §1.2 "Хэрэглэгч тус бүрээр эрх тохируулах".
 *
 * WHAT EXISTS AND WHAT DOES NOT. The four tables have been in the schema for
 * years - Roles, Permissions, RoleToPermission, UserToRole - and the web has
 * management screens for two of them (view/Security/Permissions.jsx,
 * RoleToPermission.jsx). Nothing has ever READ them. Every access decision in
 * this system is a numeric RoleId comparison plus OrganizationId scoping
 * (CLAUDE.md §3). This file is the first reader.
 *
 * THE MATRIX IS POPULATED FOR EXACTLY ONE ROLE. Measured on MnCardio_test
 * 2026-09-14: Permissions holds 131 rows and RoleToPermission holds 125 grants,
 * and EVERY ONE OF THEM BELONGS TO RoleId 1, the administrator. Roles 2 and 3 -
 * the two doctor tiers, who are the entire audience of /api/doctor/* - have not
 * a single grant between them. UserToRole has 306 rows but none for the doctors
 * sampled; their role comes from Users.RoleId alone.
 *
 * SO AN ENFORCING GATE WOULD DENY EVERY DOCTOR EVERYTHING on the day it was
 * switched on. That is why this is a three-way flag rather than a boolean, with
 * the same shape as FEATURE_DOCTOR_LICENCE and FEATURE_CONFIDENTIALITY:
 *
 *   off      (default) nothing is checked
 *   warn               denials are LOGGED and allowed - this is how the matrix
 *                      gets written from evidence instead of guesswork
 *   enforce            403 PERMISSION_DENIED
 *
 * The order matters: seed RoleToPermission for roles 2 and 3, run 'warn'
 * against real traffic to see what that seeding missed, and only then enforce.
 *
 * NOTE WHAT 'warn' CAN AND CANNOT TELL YOU. A user with NO grants at all falls
 * into the 'unconfigured' branch below and is allowed silently - so with the
 * matrix in its current state, warn mode logs nothing for doctors. It becomes
 * informative only once a doctor role has some grants, at which point it names
 * the objects that seeding missed. Turning warn on and seeing an empty log is
 * therefore not evidence that enforcing is safe.
 *
 * EXPOSING THE MATRIX IS SAFE TODAY EVEN THOUGH ENFORCING IT IS NOT.
 * GET /api/doctor/me returns Of(), so the app can grey out a menu item a user
 * has no permission for. An empty array means "nothing configured", and the
 * client must treat that as "show everything" rather than "show nothing" -
 * otherwise turning the feature on becomes a prerequisite for the app working
 * at all.
 */

const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
const Flags = require('./FeatureFlags');

const TTL_MS = 5 * 60 * 1000;
const Cache = new Map(); // UserId -> { At, Value }

/**
 * Every permission this user holds, aggregated across all their roles.
 *
 * UNION OF ROLES, NOT INTERSECTION: a user with two roles can do what either
 * allows. That is what having a second role means, and an intersection would
 * make adding a role take permissions away.
 *
 * Two sources of role membership, because both exist in this schema:
 *   - UserToRole, the table the tender's requirement refers to
 *   - Users.RoleId, the single numeric role everything actually uses today
 * Reading only the first would return nothing for every existing account.
 */
async function Of(UserId) {
  if (!UserId) return [];

  const Now = Date.now();
  const Hit = Cache.get(UserId);
  if (Hit && Now - Hit.At < TTL_MS) return Hit.Value;

  let rows = [];
  try {
    rows = await sequelize.query(
      `SELECT p.ObjectName                AS [object],
              MAX(CAST(ISNULL(rp.[Create],0) AS INT)) AS [create],
              MAX(CAST(ISNULL(rp.[Read],0)   AS INT)) AS [read],
              MAX(CAST(ISNULL(rp.[Update],0) AS INT)) AS [update],
              MAX(CAST(ISNULL(rp.[Delete],0) AS INT)) AS [delete]
         FROM [RoleToPermission] rp
         JOIN [Permissions] p ON p.Id = rp.PermissionId
        WHERE rp.RoleId IN (
                SELECT RoleId FROM [UserToRole] WHERE UserId = :UserId
                UNION
                SELECT RoleId FROM [Users]      WHERE Id     = :UserId
              )
          AND p.ObjectName IS NOT NULL
        GROUP BY p.ObjectName`,
      { type: Sequelize.QueryTypes.SELECT, replacements: { UserId } }
    );
  } catch (ex) {
    // A missing table or a schema difference must not take down every request
    // on the doctor surface. Empty = nothing configured = no restriction.
    console.error('[Permissions] read failed, treating as unset: ' + ex.message);
    rows = [];
  }

  const value = rows.map((r) => ({
    object: r.object,
    create: !!r.create,
    read: !!r.read,
    update: !!r.update,
    delete: !!r.delete,
  }));

  if (Cache.size > 5000) Cache.clear();
  Cache.set(UserId, { At: Now, Value: value });
  return value;
}

/**
 * May this user perform this action on this object?
 *
 * Returns { Allowed, Reason, Mode } rather than a boolean, so the caller can
 * distinguish "permitted" from "nothing is configured, so permitted for now" -
 * they look identical to a boolean and mean very different things.
 */
async function May({ LogedUser, Object: ObjectName, Action }) {
  const Mode = Flags.Permissions;

  if (Mode === 'off') return { Allowed: true, Reason: 'off', Mode };
  if (!LogedUser || !LogedUser.Id) return { Allowed: true, Reason: 'no-user', Mode };

  // Role 1 is the administrator. An RBAC matrix that can lock the administrator
  // out of the screens used to fix the matrix is a trap, not a control.
  if (String(LogedUser.RoleId) === '1') return { Allowed: true, Reason: 'admin', Mode };

  const list = await Of(LogedUser.Id);

  // NOTHING CONFIGURED IS NOT THE SAME AS FORBIDDEN. Roles 2 and 3 hold no
  // grants at all today, so without this every doctor would be denied
  // everything the moment the flag moved off 'off'. "Unconfigured" means the
  // control is not in use for this user yet.
  if (!list.length) return { Allowed: true, Reason: 'unconfigured', Mode };

  const row = list.find((p) => String(p.object) === String(ObjectName));
  if (!row) return { Allowed: false, Reason: 'no-entry', Mode };

  return { Allowed: !!row[Action], Reason: row[Action] ? 'granted' : 'denied', Mode };
}

/** Drop a user's cached permissions - call after their roles change. */
function Invalidate(UserId) {
  if (!UserId) return Cache.clear();
  Cache.delete(UserId);
}

module.exports = { Of, May, Invalidate, TTL_MS };
