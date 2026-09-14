/**
 * The forced-update gate — mobile tender §2.1 "Автоматаар шинэчлэгдэх".
 *
 * The app stores update an app on their own schedule, and a user can decline an
 * update indefinitely. When an API changes incompatibly there has to be a way
 * to stop an old build talking to this server, and to tell it why in a form it
 * can act on. That is this: a client sends `X-App-Build`, and a build below
 * MobileSetting.minSupportedBuild is refused with **426 Upgrade Required**.
 *
 * 426 rather than 400 or 403 on purpose - it is the one status whose meaning is
 * exactly "your client is too old", so the app branches on the code and not on
 * a translated message.
 *
 * A MISSING HEADER MUST PASS, AND THIS IS THE MOST IMPORTANT LINE IN THE FILE.
 * Every build in the field today sends no X-App-Build at all, and so does the
 * web frontend, which shares /api/doctor. Treating absent as 0 would refuse all
 * of them the moment minSupportedBuild was raised above zero - the gate would
 * brick exactly the users it exists to protect. Absent means "cannot tell",
 * and the only safe answer to that is to let it through.
 *
 * minSupportedBuild is 0 in the seed, so this denies nothing until somebody
 * deliberately raises it. helper/MobileSettings.js caches it for a minute and
 * fails open if the table is unreadable.
 */

const MobileSettings = require('./MobileSettings');

const requireAppBuild = async (req, res, next) => {
  try {
    const raw = req.headers['x-app-build'];

    // No header: an older build, or the web frontend. Let it through - see above.
    if (raw === undefined || raw === null || String(raw).trim() === '') return next();

    const build = Number.parseInt(String(raw), 10);
    // Unparseable is treated the same as absent rather than as 0. A malformed
    // header is a client bug, not evidence that the client is out of date.
    if (!Number.isFinite(build)) return next();

    const min = await MobileSettings.GetInt('minSupportedBuild', 0);
    if (!min || build >= min) return next();

    const [storeAndroid, storeIos, latest] = await Promise.all([
      MobileSettings.Get('storeUrlAndroid', null),
      MobileSettings.Get('storeUrlIos', null),
      MobileSettings.Get('latestVersion', null),
    ]);

    return res.status(426).json({
      success: false,
      code: 'UPDATE_REQUIRED',
      message: 'Аппликейшнаа шинэчилнэ үү',
      data: {
        build,
        minSupportedBuild: min,
        latestVersion: latest,
        // Both, because the header does not say which platform sent it and the
        // client knows perfectly well which one it is.
        storeUrlAndroid: storeAndroid,
        storeUrlIos: storeIos,
      },
    });
  } catch (ex) {
    // Never let this middleware be the reason a request fails. It is a kill
    // switch; a broken kill switch must be inert, not fatal.
    console.error('[RequireAppBuild] ' + ex.message);
    return next();
  }
};

module.exports = requireAppBuild;
