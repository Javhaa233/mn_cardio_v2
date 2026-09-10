const nodemailer = require('nodemailer');

class MailHelper {
  // Last failure reason, so callers can report something useful to the user.
  LastError = null;

  BuildTransport = (user, pass) => {
    // Custom SMTP host wins, otherwise fall back to Gmail / Google Workspace.
    const host = process.env.MAIL_SMTP_HOST;
    if (host) {
      const port = parseInt(process.env.MAIL_SMTP_PORT || '587', 10);
      return nodemailer.createTransport({
        host,
        port,
        secure: process.env.MAIL_SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass },
      });
    }
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: { user, pass },
    });
  };

  SendMail = async (Mail) => {
    this.LastError = null;
    const user = (process.env.MAIL_USER_NAME || '').trim();
    // Google shows App Passwords in four groups; the spaces are display only.
    const pass = (process.env.MAIL_USER_PASS || '').replace(/\s/g, '');

    if (!user || !pass) {
      this.LastError = 'MAIL_USER_NAME or MAIL_USER_PASS is missing in environment variables.';
      console.error('MailHelper Error:', this.LastError);
      return null;
    }

    // Google App Passwords are 16 characters. Anything else against Gmail will
    // always fail with 535 BadCredentials, so say so before we even connect.
    if (!process.env.MAIL_SMTP_HOST && pass.length !== 16) {
      console.warn(
        `MailHelper Warning: MAIL_USER_PASS is ${pass.length} characters. Gmail/Google Workspace SMTP requires a 16-character App Password (https://support.google.com/accounts/answer/185833).`
      );
    }

    try {
      const transporter = this.BuildTransport(user, pass);
      const MailData = { from: user, ...Mail };
      const info = await transporter.sendMail(MailData);
      console.log('Mail sent successfully:', info.messageId);
      return info;
    } catch (ex) {
      this.LastError = ex.message;
      console.error('MailHelper Error:', ex.message);
      if (ex.responseCode === 535) {
        this.LastError =
          'SMTP authentication failed (535). Gmail requires a 16-character App Password.';
        console.error(
          'HINT: This is an authentication error. If you are using Gmail, you likely need to use an "App Password" instead of your regular password. See: https://support.google.com/accounts/answer/185833'
        );
      }
      return null;
    }
  };
}

module.exports = new MailHelper();
