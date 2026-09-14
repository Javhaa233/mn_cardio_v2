/**
 * Push notifications, shaped after helper/MailHelper.js on purpose.
 *
 * Same contract as mail, so the two are learned once: a LastError field, a
 * BuildTransport that picks a driver from whatever the environment provides,
 * and a send that clears LastError, refuses early with an explanation when it
 * cannot work, and returns null rather than throwing.
 *
 * NEVER THROWS. Push is a side effect of something that already succeeded -
 * a reply was saved, a slot was confirmed - and a dead APNs gateway must not
 * turn a working clinical write into a 500.
 *
 * WITHOUT CREDENTIALS THIS STILL WORKS. The log driver reports success, so
 * registration, fan-out and dead-token deactivation are all exercisable today,
 * on the test server, with nothing from ЗСҮТ. See services/push/LogDriver.js for
 * why it reports success rather than failure. That matters because the Firebase
 * project and the Apple key have a lead time measured in weeks and are on
 * nobody's critical path yet (mobile/BLOCKERS.md items 2 and 3).
 */

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const ObjectHelper = require('./ObjectHelper');
const { Models, Op } = require('../config/DB');

const LogDriver = require('../services/push/LogDriver');
const FcmV1Driver = require('../services/push/FcmV1Driver');
const ApnsDriver = require('../services/push/ApnsDriver');

const HasFcm = () =>
  !!(process.env.FCM_PROJECT_ID && process.env.FCM_CLIENT_EMAIL && process.env.FCM_PRIVATE_KEY);

const HasApns = () =>
  !!(
    process.env.APNS_KEY_ID &&
    process.env.APNS_TEAM_ID &&
    process.env.APNS_PRIVATE_KEY &&
    process.env.APNS_BUNDLE_ID
  );

class PushHelper {
  LastError = null;

  /**
   * Both, not either: the table can exist a release before the model does.
   *
   * AWAITS Warm() rather than assuming it has already run. SchemaProbe is
   * warmed once from startServer(), but anything that reaches this helper on
   * another path - a job, a script, a test harness mounting the routers
   * directly - would otherwise find an unwarmed probe, get `false`, and report
   * PUSH_UNAVAILABLE on a database where the table is plainly present. Warm()
   * is idempotent and returns immediately once cached, so this costs nothing
   * after the first call and removes the boot-order dependency entirely.
   */
  Available = async () => {
    await SchemaProbe.Warm();
    return SchemaProbe.HasTable('PushDevice') && !!Models.PushDevice;
  };

  /**
   * Which driver handles a given platform.
   *
   * PUSH_DRIVER=log forces the log driver even when credentials exist, which is
   * what you want on a test server that shares a Firebase project with
   * production - otherwise a test run rings real patients' phones.
   */
  BuildTransport = (Platform) => {
    if (Flags.PushDriver === 'log') return new LogDriver();

    const P = String(Platform || '').toLowerCase();

    if (Flags.PushDriver === 'fcm') return HasFcm() ? new FcmV1Driver() : new LogDriver();
    if (Flags.PushDriver === 'apns') return HasApns() ? new ApnsDriver() : new LogDriver();

    // auto: iOS to APNs when configured, everything else to FCM when
    // configured, log otherwise. A Flutter iOS build can legitimately use
    // either, so APNs wins only if it is actually set up.
    if (P === 'ios' && HasApns()) return new ApnsDriver();
    if (HasFcm()) return new FcmV1Driver();
    if (HasApns()) return new ApnsDriver();
    return new LogDriver();
  };

  /**
   * Send to every active device belonging to one identity.
   *
   * @param {'S'|'P'} UserType  staff or patient - the ChatIdentity pair
   * @param {number}  UserId    Users.Id for 'S', Patient.id_data for 'P'
   * @returns {{sent:number, failed:number, deactivated:number}|null}
   */
  Send = async ({ UserType, UserId, Title, Body, Data }) => {
    this.LastError = null;

    try {
      if (!UserType || !UserId) {
        this.LastError = 'PUSH_NO_RECIPIENT';
        return null;
      }

      if (!(await this.Available())) {
        this.LastError =
          'PUSH_TABLE_MISSING: scripts/add_push_device_tokens.sql has not been run here.';
        return null;
      }

      const devices = await Models.PushDevice.findAll({
        where: { UserType: String(UserType), UserId, IsActive: true },
        raw: true,
      });

      if (!devices.length) {
        // Not an error. Most people have no device registered, and a caller
        // should not log a failure every time it notifies one of them.
        this.LastError = null;
        return { sent: 0, failed: 0, deactivated: 0 };
      }

      let sent = 0;
      let failed = 0;
      let deactivated = 0;

      for (const d of devices) {
        const driver = this.BuildTransport(d.Platform);
        let res;
        try {
          res = await driver.Send({
            Token: d.Token,
            Platform: d.Platform,
            Title,
            Body,
            Data,
          });
        } catch (ex) {
          res = { ok: false, error: ex.message };
        }

        if (res && res.ok) {
          sent++;
          await Models.PushDevice.update(
            { LastSeenDate: ObjectHelper.getDateYMDHMS(), FailCount: 0 },
            { where: { Id: d.Id } }
          );
          continue;
        }

        failed++;
        this.LastError = (res && res.error) || 'PUSH_SEND_FAILED';

        if (res && res.gone) {
          // The token is dead: the app was uninstalled or the token rotated.
          // Deactivate rather than delete, so the row remains as evidence of
          // which device it was.
          deactivated++;
          await Models.PushDevice.update(
            {
              IsActive: false,
              DisabledReason: String(res.error || 'gone').slice(0, 100),
              UpdateDate: ObjectHelper.getDateYMDHMS(),
            },
            { where: { Id: d.Id } }
          );
        } else {
          await Models.PushDevice.update(
            { FailCount: (d.FailCount || 0) + 1, UpdateDate: ObjectHelper.getDateYMDHMS() },
            { where: { Id: d.Id } }
          );
        }
      }

      return { sent, failed, deactivated };
    } catch (ex) {
      this.LastError = ex.message;
      console.error('[PushHelper] ' + ex.message);
      return null;
    }
  };

  /**
   * Register or re-register a device token.
   *
   * THE UPSERT IS A PRIVACY CONTROL, NOT AN OPTIMISATION. A token identifies a
   * device install, not a person, and one device can be used by several people
   * - a shared clinic tablet, or a family phone. If the same token were
   * inserted again under a new owner, the previous owner's rows would still
   * match it and they would keep receiving somebody else's clinical
   * notifications. So a token that already exists is MOVED to the new owner.
   */
  Register = async ({ UserType, UserId, Token, Platform, DeviceId, AppVersion, Locale }) => {
    this.LastError = null;

    if (!(await this.Available())) {
      this.LastError = 'PUSH_TABLE_MISSING';
      return null;
    }
    if (!Token || !Platform) {
      this.LastError = 'PUSH_TOKEN_REQUIRED';
      return null;
    }

    const Now = ObjectHelper.getDateYMDHMS();
    const existing = await Models.PushDevice.findOne({ where: { Token }, raw: true });

    if (existing) {
      await Models.PushDevice.update(
        {
          UserType: String(UserType),
          UserId,
          Platform,
          DeviceId: DeviceId || existing.DeviceId,
          AppVersion: AppVersion || existing.AppVersion,
          Locale: Locale || existing.Locale,
          IsActive: true,
          DisabledReason: null,
          FailCount: 0,
          LastSeenDate: Now,
          UpdateDate: Now,
        },
        { where: { Id: existing.Id } }
      );
      return { Id: existing.Id, moved: String(existing.UserId) !== String(UserId) };
    }

    const created = await Models.PushDevice.create({
      UserType: String(UserType),
      UserId,
      Platform,
      Token,
      DeviceId: DeviceId || null,
      AppVersion: AppVersion || null,
      Locale: Locale || null,
      IsActive: true,
      FailCount: 0,
      LastSeenDate: Now,
      CreateDate: Now,
      UpdateDate: Now,
    });

    return { Id: created.Id, moved: false };
  };

  /** Deregister on logout. Only ever touches the caller's own row. */
  Unregister = async ({ UserType, UserId, Token }) => {
    this.LastError = null;
    if (!(await this.Available())) {
      this.LastError = 'PUSH_TABLE_MISSING';
      return null;
    }
    if (!Token) {
      this.LastError = 'PUSH_TOKEN_REQUIRED';
      return null;
    }

    const [count] = await Models.PushDevice.update(
      {
        IsActive: false,
        DisabledReason: 'unregistered',
        UpdateDate: ObjectHelper.getDateYMDHMS(),
      },
      { where: { Token, UserType: String(UserType), UserId } }
    );
    return { deactivated: count };
  };

  /** The caller's own registered devices. Never returns the token itself. */
  List = async ({ UserType, UserId }) => {
    if (!(await this.Available())) return [];
    const rows = await Models.PushDevice.findAll({
      where: { UserType: String(UserType), UserId, IsActive: true },
      attributes: ['Id', 'Platform', 'DeviceId', 'AppVersion', 'Locale', 'LastSeenDate', 'CreateDate'],
      order: [['LastSeenDate', 'DESC']],
      raw: true,
    });
    return rows;
  };
}

module.exports = new PushHelper();
module.exports.Op = Op;
