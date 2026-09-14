const MobileSettings = require('../../helper/MobileSettings');

/**
 * Handlers for /api/mobile/*. Same lowercase envelope as the rest of api/**.
 */

const ok = (res, data) => res.json({ success: true, message: '', data });

const serverError = (res, ex, where) => {
  console.error('[api/mobile] ' + where + ':', ex);
  return res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Сервер дээр алдаа гарлаа',
    data: null,
  });
};

/**
 * What version the app should be on, and whether it may keep running.
 *
 * UNAUTHENTICATED, deliberately. A build old enough to be blocked may also be
 * old enough that its login flow no longer works, and an update prompt the user
 * can only see after signing in is no use to someone who cannot sign in. It
 * discloses nothing but the published version of a public app store listing.
 *
 * `forceUpdate` is the ANSWER, not the setting: it is true when this specific
 * build is below minSupportedBuild, or when the customer has set the global
 * forceUpdate flag for a release that must be taken. The client should not have
 * to compare build numbers itself.
 */
exports.version = async (req, res) => {
  try {
    const platform = String(req.query.platform || '').toLowerCase();
    const build = Number.parseInt(String(req.query.build || ''), 10);

    const [latestVersion, latestBuild, minSupportedBuild, forced, notes, android, ios] =
      await Promise.all([
        MobileSettings.Get('latestVersion', null),
        MobileSettings.GetInt('latestBuild', 0),
        MobileSettings.GetInt('minSupportedBuild', 0),
        MobileSettings.GetBool('forceUpdate', false),
        MobileSettings.Get('releaseNotes', null),
        MobileSettings.Get('storeUrlAndroid', null),
        MobileSettings.Get('storeUrlIos', null),
      ]);

    // Unknown or absent build: not forced. The same rule the X-App-Build gate
    // follows - "cannot tell" is never grounds for blocking a user.
    const tooOld = Number.isFinite(build) && minSupportedBuild > 0 && build < minSupportedBuild;

    // ios / android pick the matching store; anything else gets neither rather
    // than a guess, and the client already knows which one it wants.
    const storeUrl = platform === 'ios' ? ios : platform === 'android' ? android : null;

    return ok(res, {
      latestVersion,
      latestBuild,
      minSupportedBuild,
      forceUpdate: tooOld || forced === true,
      storeUrl,
      storeUrlAndroid: android,
      storeUrlIos: ios,
      releaseNotes: notes,
    });
  } catch (ex) {
    return serverError(res, ex, 'version');
  }
};

/**
 * Terms of service and support details.
 *
 * Authenticated - patient or staff, either is fine, which is why this router
 * gates on VerifyTokenJson alone and not on RequirePatient or RequireDoctor.
 *
 * `termsText` is EMPTY until ЗСҮТ's legal department supply it (the tender
 * makes the wording theirs). An empty string is the honest state; the client
 * should show "not configured" rather than an error, exactly as it does for an
 * unseeded option list.
 *
 * `termsVersion` is what the app compares against the version the user last
 * accepted, so revised terms trigger a fresh consent without an app release.
 */
exports.config = async (req, res) => {
  try {
    const [termsText, termsVersion, supportPhone] = await Promise.all([
      MobileSettings.Get('termsText', ''),
      MobileSettings.GetInt('termsVersion', 0),
      MobileSettings.Get('supportPhone', ''),
    ]);

    return ok(res, { termsText, termsVersion, supportPhone });
  } catch (ex) {
    return serverError(res, ex, 'config');
  }
};
