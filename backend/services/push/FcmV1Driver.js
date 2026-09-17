/**
 * Firebase Cloud Messaging, HTTP v1, over plain HTTPS.
 *
 * NO SDK, DELIBERATELY. firebase-admin pulls a large dependency tree into a
 * backend whose stack is fixed by contract at Node + Express, and everything
 * v1 needs is already here: sign a service-account JWT with jsonwebtoken,
 * exchange it for an access token, POST the message with axios. That is the
 * whole protocol.
 *
 * Credentials come from the service-account JSON ЗСҮТ will download from the
 * Firebase console:
 *   FCM_PROJECT_ID    "project_id"
 *   FCM_CLIENT_EMAIL  "client_email"
 *   FCM_PRIVATE_KEY   "private_key", with its newlines escaped as \n
 *
 * The escaped-newline handling matters: a PEM key cannot survive a .env file
 * with real line breaks, so every deployment stores it escaped and every
 * reader has to undo that. Forgetting produces an opaque "error:0909006C" from
 * the crypto layer rather than anything mentioning newlines.
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

class FcmV1Driver {
  name = 'fcm';

  constructor() {
    this.projectId = process.env.FCM_PROJECT_ID;
    this.clientEmail = process.env.FCM_CLIENT_EMAIL;
    this.privateKey = String(process.env.FCM_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    this.accessToken = null;
    this.expiresAt = 0;
  }

  /** Cached until a minute before expiry - Google's tokens last an hour. */
  async GetAccessToken() {
    const Now = Date.now();
    if (this.accessToken && Now < this.expiresAt - 60000) return this.accessToken;

    const iat = Math.floor(Now / 1000);
    const assertion = jwt.sign(
      {
        iss: this.clientEmail,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat,
        exp: iat + 3600,
      },
      this.privateKey,
      { algorithm: 'RS256' }
    );

    const res = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
      { headers: { 'content-type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );

    this.accessToken = res.data.access_token;
    this.expiresAt = Now + (res.data.expires_in || 3600) * 1000;
    return this.accessToken;
  }

  async Send({ Token, Title, Body, Data }) {
    const access = await this.GetAccessToken();

    // FCM requires every data value to be a STRING. A number here is rejected
    // with a 400 that names the field but not the reason.
    const data = {};
    Object.keys(Data || {}).forEach((k) => {
      if (Data[k] !== null && Data[k] !== undefined) data[k] = String(Data[k]);
    });

    try {
      await axios.post(
        'https://fcm.googleapis.com/v1/projects/' + this.projectId + '/messages:send',
        { message: { token: Token, notification: { title: Title, body: Body }, data } },
        {
          headers: { authorization: 'Bearer ' + access, 'content-type': 'application/json' },
          timeout: 15000,
        }
      );
      return { ok: true, driver: 'fcm' };
    } catch (ex) {
      const status = ex.response ? ex.response.status : 0;
      const detail =
        ex.response && ex.response.data ? JSON.stringify(ex.response.data) : ex.message;

      // UNREGISTERED / INVALID_ARGUMENT on the token means the app was
      // uninstalled or the token rotated. Reported as `gone` so PushHelper
      // deactivates the row instead of retrying it forever.
      const gone =
        status === 404 ||
        /UNREGISTERED|INVALID_ARGUMENT|NOT_FOUND|InvalidRegistration/i.test(detail);

      return { ok: false, driver: 'fcm', gone, error: detail.slice(0, 300) };
    }
  }
}

module.exports = FcmV1Driver;
