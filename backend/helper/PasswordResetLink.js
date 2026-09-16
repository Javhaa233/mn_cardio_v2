/**
 * One-time "choose your password" links for staff accounts (Users).
 *
 * Used by /User/ForgetPassword, and by UserRequest/Confirm for a request filed
 * before applicants chose their own password - that account starts with no
 * password at all, and this link is how its owner sets one.
 *
 * Only the sha256 of the token is stored (Users.ForgotPassToken); the raw token
 * exists in the emailed link and nowhere else. The expiry is written and read as
 * a JS Date so Sequelize applies the same timezone both ways - the old code
 * wrote a formatted local-time string and never read it back at all.
 */

const crypto = require('crypto');
const { Models } = require('../config/DB');

const MINUTE = 60 * 1000;

function HashToken(Token) {
  return crypto.createHash('sha256').update(String(Token)).digest('hex');
}

/** Stores a fresh token on the user and returns the link to email. */
async function Issue({ UserId, UserName, ValidMinutes }) {
  const Token = crypto.randomBytes(20).toString('hex');
  await Models.Users.update(
    {
      ForgotPassToken: HashToken(Token),
      ForgotPassExpireDate: new Date(Date.now() + ValidMinutes * MINUTE),
    },
    { where: { Id: UserId } }
  );
  return (
    process.env.CLIENT_APP_URL +
    'auth/ResetPassword?UserName=' +
    encodeURIComponent(UserName) +
    '&Token=' +
    encodeURIComponent(Token)
  );
}

/** True when Token is the one issued to this user and has not expired. */
function IsValid(User, Token) {
  if (!User || !User.ForgotPassToken || !Token) return false;
  if (User.ForgotPassToken !== HashToken(Token)) return false;
  const Expires = User.ForgotPassExpireDate ? new Date(User.ForgotPassExpireDate).getTime() : 0;
  return Expires > Date.now();
}

module.exports = { Issue, IsValid };
