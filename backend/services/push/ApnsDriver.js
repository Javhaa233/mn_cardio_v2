/**
 * Apple Push Notification service, over Node's built-in HTTP/2.
 *
 * APNs requires HTTP/2 and axios cannot speak it, so this uses node:http2
 * directly. Still no new dependency: the ES256 provider token is signed with
 * jsonwebtoken, which is already here for the app's own JWTs.
 *
 * Credentials, from the .p8 key ЗСҮТ will create in the Apple Developer portal:
 *   APNS_KEY_ID       the key's 10-character id
 *   APNS_TEAM_ID      the team's 10-character id
 *   APNS_PRIVATE_KEY  the .p8 contents, newlines escaped as \n
 *   APNS_BUNDLE_ID    the app's bundle identifier - becomes apns-topic
 *   APNS_PRODUCTION   'true' for the production gateway
 *
 * NOTE ON THE GATEWAY. A token minted for the sandbox gateway is rejected by
 * production and vice versa, with a BadDeviceToken that looks like a client
 * bug. A TestFlight build talks to production; a Xcode debug build talks to
 * sandbox. When a device "will not receive notifications", check this before
 * anything else.
 */

const http2 = require('node:http2');
const jwt = require('jsonwebtoken');

class ApnsDriver {
  name = 'apns';

  constructor() {
    this.keyId = process.env.APNS_KEY_ID;
    this.teamId = process.env.APNS_TEAM_ID;
    this.privateKey = String(process.env.APNS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    this.bundleId = process.env.APNS_BUNDLE_ID;
    this.host =
      process.env.APNS_PRODUCTION === 'true'
        ? 'https://api.push.apple.com'
        : 'https://api.sandbox.push.apple.com';
    this.token = null;
    this.tokenAt = 0;
  }

  /**
   * Apple REFUSES a provider token refreshed more often than once every 20
   * minutes, and expires one older than 60. Reuse for 40 minutes: comfortably
   * inside both bounds.
   */
  GetProviderToken() {
    const Now = Date.now();
    if (this.token && Now - this.tokenAt < 40 * 60 * 1000) return this.token;

    this.token = jwt.sign({ iss: this.teamId, iat: Math.floor(Now / 1000) }, this.privateKey, {
      algorithm: 'ES256',
      header: { alg: 'ES256', kid: this.keyId },
    });
    this.tokenAt = Now;
    return this.token;
  }

  Send({ Token, Title, Body, Data }) {
    return new Promise((resolve) => {
      let client;
      try {
        client = http2.connect(this.host);
      } catch (ex) {
        return resolve({ ok: false, driver: 'apns', error: ex.message });
      }

      const payload = JSON.stringify({
        aps: { alert: { title: Title, body: Body }, sound: 'default' },
        data: Data || {},
      });

      const req = client.request({
        ':method': 'POST',
        ':path': '/3/device/' + Token,
        authorization: 'bearer ' + this.GetProviderToken(),
        'apns-topic': this.bundleId,
        'apns-push-type': 'alert',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      });

      let status = 0;
      let body = '';

      req.on('response', (h) => {
        status = h[':status'];
      });
      req.on('data', (d) => (body += d));
      req.on('error', (e) => {
        client.close();
        resolve({ ok: false, driver: 'apns', error: e.message });
      });
      req.on('end', () => {
        client.close();
        if (status === 200) return resolve({ ok: true, driver: 'apns' });

        // 410 Gone is Apple's explicit "this token is dead"; BadDeviceToken
        // means the same thing arriving as a 400.
        const gone = status === 410 || /BadDeviceToken|Unregistered/i.test(body);
        resolve({ ok: false, driver: 'apns', gone, error: status + ' ' + body.slice(0, 200) });
      });

      req.end(payload);
    });
  }
}

module.exports = ApnsDriver;
