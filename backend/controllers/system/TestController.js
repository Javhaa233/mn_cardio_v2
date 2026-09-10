const express = require('express');
const router = express.Router();
const { PDFDocument } = require('pdf-lib');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const Ambulatori = require('../../reports/Ambulatori');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');
const BaseHelper = require('../../helper/BaseHelper');
const MailHelper = require('../../helper/MailHelper');

// routes
router.get('/print', print);
router.get('/printNew', printNew);
router.put('/uploadFile', uploadFile);
router.get('/ApiSendMail', ApiSendMail);
router.post('/CheckRegisterRegex', CheckRegisterRegex);
router.post('/RegexTest', RegexTest);

/**
 * Renders the АМ-1Б template with no data - a layout smoke test.
 *
 * NOTE: this router is mounted in `routeGroups.public`, so this is reachable
 * WITHOUT a token. It leaks nothing (Ambulatori() with no argument renders the
 * empty register), but it used to start and tear down a Chrome per request,
 * which made an unauthenticated endpoint an easy way to exhaust the box. It now
 * shares the pooled browser like every other report.
 *
 * Whether /Test belongs in the public group at all is a separate question - see
 * uploadFile below.
 */
async function print(req, res) {
  try {
    const html = Ambulatori();
    return await PrintHelper.SendPdf({
      res,
      html,
      namePrefix: 'AmbulatoriTemplate',
      downloadName: 'AmbulatoriTemplate.pdf',
      landscape: true,
      scale: 0.88,
      margin: { top: '5mm', bottom: '11mm', left: '5mm', right: '5mm' },
    });
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function printNew(req, res) {
  try {
    const pdfDoc = await PDFDocument.load(
      fs.readFileSync(path.join(__dirname, '../../htmlReport/Ambulatori.pdf'))
    );

    // return res.download(pdf);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function uploadFile(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const form = new formidable.IncomingForm({
      maxFileSize: 1000 * 1024 * 1024,
      maxFieldsSize: 1000 * 1024 * 1024,
      multiples: true,
      keepExtensions: true,
      uploadDir: path.join(__dirname, '../../tmpFile'),
    });

    const Data = await new Promise(function (resolve, reject) {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else {
          for (var Field in fields) {
            //new file
            var key = Field.replace('Info', '');
            let NewFile = files[key];
            if (Array.isArray(NewFile)) {
              NewFile = NewFile[0];
            }
            if (NewFile) {
              const OldPath = NewFile.filepath || NewFile.path;
              const FileName = BaseHelper.getDateNumbers() + '_' + '320' + '_0';
              //var Path = "C:\\MnCardioFiles\\";
              const Path = process.env.ALLFILE_DIR;
              const DestPath = Path + '' + FileName;
              fs.copyFile(OldPath, DestPath, function (error) {
                if (error) {
                  console.error('File copy error:', error);
                } else {
                  fs.unlink(OldPath, function (err) {
                    if (err) console.error('Failed to delete temp file:', err);
                  });
                }
              });
              resolve();
            }
          }
        }
      });
    });

    result.Data = { Data };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function ApiSendMail(req, res) {
  try {
    //   Email send
    const email = 'sw10d239@gmail.com';
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email && email !== '' && emailRegex.test(email)) {
      var link = process.env.CLIENT_APP_URL + 'auth/login';
      const EmailTemplate = {
        to: email,
        subject: 'MnCardio хэрэглэгчийн эрх үүсгэсэн.',
        html: `Сайн байна уу<br />Та манай системд дараах хэрэглэгчийн нэр, нууц үгээр нэвтэрнэ үү.<br />
  <br /><a target="_blank" href="${link}">${link}</a><br /><br />Хэрэглэгчийн нэр: Test<br />Нууц үг: Test<br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
      };
      var EmailRes = await MailHelper.SendMail(EmailTemplate);
      if (!EmailRes && EmailRes === null) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('An error occurred while sending email')
          )
        );
      } else {
        return res.send(JSON.stringify(EmailRes));
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('И-мэйлийн формат буруу байна'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Амжилтгүй')));
  }
}

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
