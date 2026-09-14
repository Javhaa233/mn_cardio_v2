/**
 * The driver used when no push credentials are configured.
 *
 * This is not a stub to be replaced later - it is what makes the whole push
 * feature buildable, deployable and testable BEFORE ЗСҮТ supply an FCM project
 * and an APNs key, which they have not and which have a lead time measured in
 * weeks (Apple organisation enrolment needs a D-U-N-S number).
 *
 * It therefore reports SUCCESS, deliberately. If it reported failure, every
 * caller would take its error branch today and a different branch once real
 * credentials arrived - so the thing that finally ran in production would be
 * the path nobody had exercised. Reporting success means the only difference
 * when credentials land is that a device actually buzzes.
 *
 * LastError still carries an explanation, so a developer wondering why their
 * phone is silent finds the reason rather than a mystery.
 */
class LogDriver {
  name = 'log';

  async Send({ Token, Platform, Title, Body, Data }) {
    // console.error, not console.log: server.js silences console.log in
    // production, and "push is not configured" is exactly what you want to see
    // in a production log.
    console.error(
      '[PushHelper/log] WOULD SEND to ' +
        String(Platform || '?') +
        ' ' +
        String(Token || '').slice(0, 12) +
        '... :: ' +
        JSON.stringify({ Title, Body, Data }).slice(0, 300)
    );

    return { ok: true, driver: 'log', simulated: true };
  }
}

module.exports = LogDriver;
