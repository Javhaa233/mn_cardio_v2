const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

/**
 * This router is mounted in `routeGroups.public` (server.js), so EVERY route on
 * it is reachable with no token. That was true of six routes; it is now true of
 * two, and both are pure functions over a string.
 *
 * Four routes were deleted on 2026-09-14 rather than moved behind auth. The
 * standing concern was that moving the route group might break callers -
 * deleting the routes individually settles that without touching the group, and
 * each one was either unreachable or reproducible through an authenticated
 * route:
 *
 *   PUT /uploadFile   An unauthenticated 1 GB upload (formidable,
 *                     keepExtensions) into ALLFILE_DIR - the same directory
 *                     that holds patient attachments - under the hardcoded name
 *                     getDateNumbers() + '_320_0', with no File row written, so
 *                     nothing could ever read a byte back. Nothing called it
 *                     either: the only caller chain is FileUpload.jsx ->
 *                     BaseCrudHelper.baseUploadTest, which at
 *                     BaseCrudHelper.jsx:156 calls `this.uploadTes` while the
 *                     method is named `uploadTest`. It threw TypeError before
 *                     issuing a request. Dead, not merely unused.
 *
 *   GET /ApiSendMail  Sent mail to a hardcoded gmail address with no token - an
 *                     open relay pointed at one inbox.
 *
 *   GET /printNew     Loaded a PDF into pdf-lib and returned nothing; the
 *                     response was never sent, so the request hung until the
 *                     client timed out.
 *
 *   GET /print        An unauthenticated Puppeteer render of the AM-1B layout.
 *                     The same output comes from POST /api/Visit/PrintAmbulatori,
 *                     which requires a token.
 *
 * The two that remain take a string and return a boolean. They touch no
 * database, no filesystem and no mail transport, and the registration screen
 * plausibly calls them before anyone has a token - which is why they stay
 * public rather than becoming a fifth deletion.
 */

// routes
router.post('/CheckRegisterRegex', CheckRegisterRegex);
router.post('/RegexTest', RegexTest);

async function CheckRegisterRegex(req, res) {
  const RegistrationNumberRegex = /[^\u0000-\u007F][^\u0000-\u007F][0-9]{8}$/;
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: '' };

    const { SearchText } = req.body;

    result.Data = RegistrationNumberRegex.test(SearchText);
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Амжилтгүй')));
  }
}

async function RegexTest(req, res) {
  const CryllicRegex = /[^\u0000-\u00FE]+$/;
  try {
    var result = {
      Success: true,
      Message: 'Successfully saved',
      Name: null,
      Check: false,
    };

    const { Name = null } = req.body;

    result.Name = Name;
    result.Check = CryllicRegex.test(Name.replace('-', ''));
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Амжилтгүй')));
  }
}

module.exports = router;
