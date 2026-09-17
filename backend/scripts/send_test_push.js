/**
 * Send a test push to your own registered devices.
 *
 *   node scripts/send_test_push.js --type P --id 123
 *   node scripts/send_test_push.js --type S --id 45 --body "Hello"
 *
 * Mirrors scripts/send_test_mail.js and check_mail_credentials.js, which exist
 * for the same reason: a delivery channel you cannot test from the command line
 * is one you debug through the application, in production, at the worst moment.
 *
 * WORKS WITH NO CREDENTIALS. With no FCM or APNs keys configured the log driver
 * runs and reports success, printing what it WOULD have sent - so registration
 * and fan-out are verifiable today. That is deliberate; see
 * services/push/LogDriver.js for why it reports success rather than failure.
 *
 * UserType is 'P' for a patient (UserId is Patient.id_data) or 'S' for staff
 * (UserId is Users.Id). Those two id spaces collide, so the pair is required.
 */

require('dotenv').config({ path: './config/Config.env' });

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const UserType = String(arg('type', 'P')).toUpperCase();
const UserId = parseInt(arg('id', ''), 10);
const Title = arg('title', 'MnCardio');
const Body = arg('body', 'Туршилтын мэдэгдэл');

if (!['P', 'S'].includes(UserType) || !UserId) {
  console.error(
    'usage: node scripts/send_test_push.js --type P|S --id <userId> [--title X] [--body Y]'
  );
  console.error('  P = patient (Patient.id_data), S = staff (Users.Id)');
  process.exit(2);
}

const PushHelper = require('../helper/PushHelper');
const SchemaProbe = require('../helper/SchemaProbe');
const Flags = require('../helper/FeatureFlags');

(async () => {
  await SchemaProbe.Warm();

  console.log('driver setting : ' + Flags.PushDriver);
  console.log(
    'PushDevice     : ' +
      (SchemaProbe.HasTable('PushDevice')
        ? 'present'
        : 'MISSING - run scripts/add_push_device_tokens.sql')
  );
  console.log('FCM configured : ' + (process.env.FCM_PROJECT_ID ? 'yes' : 'no'));
  console.log('APNs configured: ' + (process.env.APNS_KEY_ID ? 'yes' : 'no'));
  console.log('');

  const devices = await PushHelper.List({ UserType, UserId });
  console.log('registered devices for ' + UserType + ':' + UserId + ' = ' + devices.length);
  devices.forEach((d) =>
    console.log('  #' + d.Id + '  ' + d.Platform + '  last seen ' + (d.LastSeenDate || '-'))
  );

  if (!devices.length) {
    console.log('');
    console.log(
      'Nothing to send to. Register one from the app first, or via POST /api/patient/devices.'
    );
    process.exit(0);
  }

  console.log('');
  const result = await PushHelper.Send({
    UserType,
    UserId,
    Title,
    Body,
    Data: { test: '1' },
  });

  console.log('');
  console.log('result: ' + JSON.stringify(result));
  if (PushHelper.LastError) console.log('last error: ' + PushHelper.LastError);
  process.exit(0);
})();
