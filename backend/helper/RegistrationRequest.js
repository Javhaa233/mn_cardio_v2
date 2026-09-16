/**
 * Doctor self-registration requests (UserRequests) - the pieces shared by
 * UserRequestController and the staff Login.
 *
 * The doctor chooses their own password when they apply. It is stored bcrypted
 * in UserRequests.PasswordHash and copied unchanged into Users.Password when an
 * administrator approves - nobody else ever sees or sends it.
 *
 * PasswordHash IS DELIBERATELY NOT DECLARED ON THE MODEL. The admin screen lists
 * and opens requests through the generic /BaseObject routes, which return every
 * declared attribute; leaving the column off the model means no generic read can
 * ever return it. It is read and written only here, with bound parameters.
 * (scripts/add_userrequest_approval_columns.sql adds the column.)
 */

const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/DB');

// UserRequests.IsActive is a status code, stored as a string.
const STATUS = { Pending: '0', Approved: '1', Declined: '2' };

async function SetPasswordHash(Id, Hash) {
  await sequelize.query('UPDATE [UserRequests] SET [PasswordHash] = :Hash WHERE [Id] = :Id', {
    replacements: { Hash, Id },
  });
}

async function GetPasswordHash(Id) {
  const [Rows] = await sequelize.query(
    'SELECT [PasswordHash] FROM [UserRequests] WHERE [Id] = :Id',
    { replacements: { Id } }
  );
  return Rows && Rows[0] ? Rows[0].PasswordHash : null;
}

/**
 * For a login whose user name matched no account: is there an open or declined
 * request behind it? Answered ONLY when the password matches the request's own,
 * so the login form cannot be used to learn which names have applied.
 * Returns a Mongolian message, or null to fall through to the generic error.
 */
async function LoginStatusMessage(UserName, Password) {
  if (!UserName || !Password) return null;
  let Rows;
  try {
    [Rows] = await sequelize.query(
      `SELECT TOP 1 [IsActive], [PasswordHash], [DeclineReason]
         FROM [UserRequests]
        WHERE [UserName] = :UserName AND [IsActive] IN ('0', '2') AND [PasswordHash] IS NOT NULL
        ORDER BY [Id] DESC`,
      { replacements: { UserName } }
    );
  } catch (ex) {
    // A database without the approval columns yet. This is a courtesy
    // message, so it must never turn a failed login into "An error occurred".
    console.error('[RegistrationRequest/LoginStatusMessage] ' + ex.message);
    return null;
  }
  const Row = Rows && Rows[0];
  if (!Row || !(await bcrypt.compare(Password, Row.PasswordHash))) return null;

  if (String(Row.IsActive) === STATUS.Pending) {
    return 'Таны бүртгэлийн хүсэлт админд хянагдаж байна. Баталгаажсаны дараа и-мэйлээр мэдэгдэнэ.';
  }
  return (
    'Таны бүртгэлийн хүсэлтийг татгалзсан.' +
    (Row.DeclineReason ? ' Шалтгаан: ' + Row.DeclineReason : '')
  );
}

module.exports = { STATUS, SetPasswordHash, GetPasswordHash, LoginStatusMessage };
