const express = require('express');
const { newPage } = require('../../helper/BrowserPool');
const fs = require('fs');
const router = express.Router();
const cors = require('cors');
const os = require('os');
const path = require('path');

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');
const ModelHelper = require('../../helper/ModelHelper');
const ObjectHelper = require('../../helper/ObjectHelper');
const PatientCredential = require('../../helper/PatientCredential');

const Visit = require('../../reports/Visit');
const Ambulatori = require('../../reports/Ambulatori');

// routes
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/CustomSave', CustomSave);
router.post('/GetVisitsByPatient', GetVisitsByPatient);
router.post('/GetLastVisitId', GetLastVisitId);
router.post('/PrintReport', PrintReport);
router.post('/PrintAmbulatori', PrintAmbulatori);
router.post('/PrintAmbulatoriHTML', PrintAmbulatoriHTML);

async function GetReportData(Id, LogedUser) {
  const VisitConfigData = await BaseControllerHelper.GetConfigData('Visit');
  const ModHelper = new ModelHelper(Models.Visit);
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'id_data', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  let { Data } = await BaseControllerHelper.BaseGetList({
    ObjectName: 'Visit',
    LogedUser,
    Option,
  });

  const Visits = ModHelper.GetNewObject(Data);
  let Credential = null;
  for (var i = 0; i < Visits.length; i++) {
    var visit = Visits[i];
    await ModHelper.GetInfoData(visit, VisitConfigData);
    visit = await BaseControllerHelper.BaseSetFiles({
      ConfigData: VisitConfigData,
      Data: visit,
    });
    const PatientId = visit.PatientId;
    // One password per patient until ДАН: the first sheet ever printed for
    // this patient issues it, later visits print the login name only (so the
    // sheet already handed over keeps working). Creates the portal account if
    // the patient has none. See helper/PatientCredential.js.
    Credential = await PatientCredential.IssueOnce({
      PatientId,
      LogedUser,
      LinkObjectName: 'Visit',
      LinkObjectId: visit.id_data,
      ExpireFrom: visit.visit_date,
    });

    const Journals = await Models.Journal.GetJournalData(
      PatientId,
      visit.id_data,
      visit.visit_date
    );
    visit['Journals'] = ModHelper.GetNewObject(Journals);
  }
  Data = Visits;
  return { Data: Data[0], Credential };
}

/**
 * The А/611 form prints «Кабинетын нэр» and «Эмчийн нэр» above the table - it
 * is a per-cabinet, per-doctor register. Both were blank underscores before.
 * The doctor is whoever is printing; the cabinet is their organisation, which
 * is the closest thing the schema has to a consulting room.
 */
function BuildAmbulatoriMeta(LogedUser, EndDate) {
  const Doctor = LogedUser && LogedUser.Doctor;
  return {
    DoctorName:
      (Doctor &&
        (Doctor.FullName || [Doctor.lastname, Doctor.firstname].filter(Boolean).join(' '))) ||
      (LogedUser && LogedUser.FullName) ||
      '',
    CabinetName: (Doctor && Doctor.Organization && Doctor.Organization.Name) || '',
    EndDate: EndDate || '',
  };
}

/**
 * Rows for the АМ-1Б register.
 *
 * Two things were wrong here and both made the printed register disagree with
 * the list the print button sits next to:
 *
 *   DATE. It filtered `date_creation` while the screen's RangeDate filters
 *   `visit_date` - and `visit_date` is also what the report's own first column
 *   prints. A visit recorded a day late, or edited later, fell outside the
 *   printed range while still showing on screen.
 *
 *   SCOPE. It filtered `{ Field: 'id', Value: LogedUser.Id }`. `Visit.id` is
 *   the CREATING USER's Users.Id (stamped by ModelHelper), not a doctor
 *   profile, so a register entered by a nurse or registrar printed empty for
 *   the doctor who owns it, and an admin printed only rows they had personally
 *   created - usually none. Scope now follows the same rule as every
 *   /BaseObject list: admins see everything, everyone else sees their own
 *   organisation and its children, via BaseControllerHelper.AddOrgFilter.
 *
 * `ExtraSearchField` carries the filters the user has applied on screen, so
 * "what you see is what you print". They are applied INSIDE the organisation
 * scope, never instead of it - AddOrgFilter runs last.
 */
async function GetAmbulatoriData(LogedUser, StartDate, EndDate, ExtraSearchField) {
  const ModHelper = new ModelHelper(Models.Visit);

  // Keep the screen's own filters except its date range, which is passed
  // separately and re-applied below in a single canonical form.
  const passedThrough = (Array.isArray(ExtraSearchField) ? ExtraSearchField : []).filter(
    (f) => f && f.Field && f.Field !== 'visit_date' && f.Field !== 'date_creation'
  );

  const Option = {
    SearchText: '',
    offset: 0,
    SearchField: [
      ...passedThrough,
      { Field: 'visit_date', Value: [StartDate, EndDate], Op: 'Between' },
    ],
    FindType: 'AllData',
    WhereType: '',
  };

  await BaseControllerHelper.AddOrgFilter({
    ObjectName: 'Visit',
    LogedUser,
    Option,
  });

  const { FindOption } = await ModHelper.GetFindOption(Option);

  let Data = await Models.Visit.findAllAmbulatori(FindOption);

  const Visits = ModHelper.GetNewObject(Data);
  for (var i = 0; i < Visits.length; i++) {
    const visit = Visits[i];

    const PatientId = visit.PatientId;
    let Journals = await Models.Journal.GetJournalData(PatientId, visit.id_data, visit.visit_date);

    Journals = Journals.filter((s) => s.JournalRef.jr_type + '' === '5');

    visit['LastJournal'] = Journals.length > 0 ? ModHelper.GetNewObject(Journals[0]) : null;
  }
  Data = Visits;

  return Data;
}

/**
 * The patient's most recent visit id.
 *
 * VisitForm.Print() has always called this endpoint, but it was never
 * implemented, so the print button fell through to "No visit found to print"
 * for every patient - which is tender item 4 ("Зүрхний эмчийн үзлэгийн маягт
 * хэвлэх"). The report template and the PDF route below both already worked;
 * only this lookup was missing.
 *
 * Accepts PatientId or PatRegNo, since callers have one or the other.
 */
async function GetLastVisitId(req, res) {
  const result = { Success: true, Message: '', Data: null };
  try {
    const { PatientId, PatRegNo } = req.body;
    if (!PatientId && !PatRegNo) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const where = {};
    if (PatientId) where.PatientId = PatientId;
    else where.PatRegNo = PatRegNo;

    const Last = await Models.Visit.findOne({
      where,
      attributes: ['id_data', 'visit_date'],
      order: [
        ['visit_date', 'DESC'],
        ['id_data', 'DESC'],
      ],
      raw: true,
    });

    if (!Last) {
      // not an error - the patient simply has no visit yet
      result.Data = null;
      return res.send(JSON.stringify(result));
    }

    result.Data = { DataId: Last.id_data, VisitDate: Last.visit_date };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.error('[Visit/GetLastVisitId]', ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function PrintReport(req, res) {
  try {
    const reportDir = process.env.REPORT_DIR;
    console.log('REPORT_DIR:', reportDir);
    if (!fs.existsSync(reportDir)) {
      console.error('REPORT_DIR does not exist:', reportDir);
      // Create the directory if it doesn't exist
      try {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log(`Created REPORT_DIR: ${reportDir}`);
      } catch (mkdirErr) {
        console.error(`Failed to create REPORT_DIR: ${reportDir}`, mkdirErr);
        return res
          .status(500)
          .send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('REPORT_DIR creation failed'))
          );
      }
    }
    const LogedUser = req.LogedUser;
    const { Id, Language } = req.body;
    if (LogedUser && Id) {
      const options = {
        format: 'A4',
        orientation: 'portrait',
        dpi: 200,
        quality: 80,
        header: { height: '8mm' },
        footer: { height: '8mm' },
        // File options
        type: 'pdf', // allowed file types: png, jpeg, pdf
        // childProcessOptions: {
        //   env: {
        //     OPENSSL_CONF: "/dev/null",
        //   },
        // },
      };

      const { Data, Credential } = await GetReportData(Id, LogedUser);

      // Never log the password itself - only whether this print issued one.
      console.log(
        '[Visit/PrintReport] portal password issued:',
        Credential && Credential.Password ? 'yes' : 'no'
      );

      const html = Visit(Data, Language, Credential);

      // One file per request: the name was a fixed constant, so two doctors
      // printing at once overwrote each other's PDF between page.pdf() and
      // res.download() - and this sheet can carry a portal password.
      const filePath = path.join(
        reportDir,
        'VisitReport_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.pdf'
      );
      let page = null;
      try {
        page = await newPage();
        // 'networkidle0' demands 500ms of network silence and hard-fails at 30s;
        // these reports are self-contained HTML, so 'load' is both correct and
        // ~30x faster. networkidle0 was timing out and returning no PDF at all.
        await page.setContent(html, { waitUntil: 'load', timeout: 20000 });
        await page.pdf({
          path: filePath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: options.header.height,
            bottom: options.footer.height,
          },
        });
        res.set('Content-Type', 'application/pdf');
        return res.download(filePath, (err) => {
          err && console.log('PrintReport download error:', err.message);
          fs.unlink(filePath, () => {});
        });
      } catch (puppeteerError) {
        console.error('Puppeteer error:', puppeteerError);
        throw puppeteerError;
      } finally {
        if (page) {
          try {
            await page.close();
          } catch (e) {
            /* the browser may already be gone */
          }
        }
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function PrintAmbulatori(req, res) {
  try {
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    var BeginDate = req.body.BeginDate;
    const LogedUser = req.LogedUser;

    if (LogedUser) {
      const Data = await GetAmbulatoriData(LogedUser, StartDate, EndDate, req.body.SearchField);
      const Meta = BuildAmbulatoriMeta(LogedUser, EndDate);
      const html = Ambulatori(Data, BeginDate, Meta);

      // АМ-1Б is a 22-column day-book and only works across the page.
      //
      // It used to declare `orientation: 'landscape'` in a plain object that was
      // read for nothing but its margin heights, so `page.pdf()` never received
      // `landscape: true` and printed the register portrait. The template's own
      // `@page {size: landscape}` (reports/Ambulatori.js) cannot rescue it either
      // - Chrome ignores @page unless `preferCSSPageSize` is set.
      //
      // The body is a fixed 1200px against ~1085px of usable landscape width, so
      // it also needs scaling down or Chrome silently clips the right-hand
      // columns off the page.
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'AmbulatoriReport',
        downloadName: 'АМ-1Б.pdf',
        landscape: true,
        scale: 0.88,
        margin: { top: '5mm', bottom: '11mm', left: '5mm', right: '5mm' },
        footer: PrintHelper.BuildFooter({
          OrganizationName: Meta && Meta.CabinetName,
          PrintedBy: LogedUser.UserName || LogedUser.Name || null,
          GeneratedAt: new Date().toLocaleString('mn-MN'),
        }),
      });
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function PrintAmbulatoriHTML(req, res) {
  try {
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    var BeginDate = req.body.BeginDate;
    const LogedUser = req.LogedUser;

    if (LogedUser) {
      const Data = await GetAmbulatoriData(LogedUser, StartDate, EndDate, req.body.SearchField);
      const html = Ambulatori(Data, BeginDate, BuildAmbulatoriMeta(LogedUser, EndDate));

      // The HTML used to be written to REPORT_DIR and immediately read back to
      // be streamed. That round-trip bought nothing, needed the directory to
      // exist, left a file behind on every call, and mangled the Cyrillic by
      // reading it back as 'binary'. Send the string.
      return res.type('html').send(html);
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const PatientId = req.body.PatientId;
    const PatRegNo = req.body.PatRegNo;
    const LogedUser = req.LogedUser;
    const Data = JSON.parse(req.body.Data);

    if (PatientId && LogedUser && Data) {
      var Journals = Object.assign([], Data.Journals);
      const RealJournals = await Models.Journal.GetRealJournalData(PatientId);
      delete Data.Journals;
      var MainDiagnosis = Data.main_diagnosis ? Data.main_diagnosis : null;

      var main_diagnosis = MainDiagnosis && MainDiagnosis.label ? MainDiagnosis.label : null;
      var main_diagnosis_mn = MainDiagnosis && MainDiagnosis.Mon ? MainDiagnosis.Mon : null;
      var main_diagnosis_ru = MainDiagnosis && MainDiagnosis.Rus ? MainDiagnosis.Rus : null;
      Data && Data.main_diagnosis && delete Data.main_diagnosis;

      // Sanitize pe_vs_heart: if non-numeric, move to Notes to avoid DB crash
      if (Data.pe_vs_heart && isNaN(Data.pe_vs_heart)) {
        const heartRateNote = `Heart rate: ${Data.pe_vs_heart}`;
        Data.Notes = Data.Notes ? `${Data.Notes}. ${heartRateNote}` : heartRateNote;
        Data.pe_vs_heart = null;
      }

      // Create, or update in place when the caller names an existing record.
      //
      // This function used to ALWAYS create: reopening an examination and
      // saving it wrote a second Visit row, and any `id_data` in the payload
      // was ignored. Tracker row №97 requires "Маягтыг нэмэх, засах, устгах,
      // хадгалах бүрэн ажиллана", so editing has to be possible.
      //
      // The id is looked up rather than trusted: an id that does not exist, or
      // belongs to a different patient, falls back to creating instead of
      // silently writing over someone else's examination.
      const RequestedId = req.body.Id || Data.id_data || null;
      let ExistingVisit = null;
      if (RequestedId) {
        ExistingVisit = await Models.Visit.findOne({
          where: { id_data: RequestedId, PatientId },
          attributes: ['id_data'],
          raw: true,
        });
        if (!ExistingVisit) {
          console.warn(
            '[Visit/CustomSave] Id ' +
              RequestedId +
              ' not found for patient ' +
              PatientId +
              ' - creating a new record instead of updating'
          );
        }
      }

      // `id_data` must never travel inside the payload: on create it would try
      // to write the identity column, and on update it is passed explicitly.
      delete Data.id_data;

      var VisitId;
      if (ExistingVisit) {
        await BaseControllerHelper.BaseUpdate({
          ObjectName: 'Visit',
          Data: {
            ...Data,
            id_data: ExistingVisit.id_data,
            main_diagnosis,
            main_diagnosis_mn,
            main_diagnosis_ru,
            PatientId,
            date_modif: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
          SaveLog: true,
        });
        VisitId = ExistingVisit.id_data;
      } else {
        VisitId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'Visit',
          Data: {
            ...Data,
            main_diagnosis,
            main_diagnosis_mn,
            main_diagnosis_ru,
            PatientId,
          },
          LogedUser,
          SaveLog: true,
        });
      }

      // The problem-list diff runs on CREATE only.
      //
      // `GetRealJournalData` returns what is open for this patient *now*, not
      // what was open at the visit being edited. On a new visit those are the
      // same thing. On an edit of an older visit they are not: a journal opened
      // last month would be closed with j_end_vid pointing at a visit that
      // predates it, quietly corrupting the patient's problem history.
      //
      // Editing an old examination therefore changes the examination only. If
      // reopening the problem list from an edit is wanted, it needs its own
      // rule from the clinical team about which visit the change belongs to.
      for (var i = 0; !ExistingVisit && i < RealJournals.length; i++) {
        var RJournal = RealJournals[i];
        var Temp = Journals.filter(
          (s) => s.JournalRef && s.JournalRef.id_data === RJournal.JournalRef.id_data
        );
        if (Temp.length === 0) {
          //Journal end new visit
          await BaseControllerHelper.BaseUpdate({
            ObjectName: 'Journal',
            Data: {
              id_data: RJournal.id_data,
              j_end_date: ObjectHelper.getDateYMD(),
              j_end_vid: VisitId,
              date_modif: ObjectHelper.getDateYMDHMS(),
            },
            LogedUser,
            SaveLog: true,
          });
        }
      }

      for (var j = 0; !ExistingVisit && j < Journals.length; j++) {
        var Jour = Journals[j];
        if (Jour.JournalRef) {
          var Temp = RealJournals.filter(
            (s) => s.JournalRef && s.JournalRef.id_data === Jour.JournalRef.id_data
          );
          if (Temp.length === 0) {
            //start Journal new visit
            var JournalId = await BaseControllerHelper.BaseCreate({
              ObjectName: 'Journal',
              Data: {
                j_begin_date: ObjectHelper.getDateYMD(),
                j_begin_vid: VisitId,
                j_label:
                  Jour.JournalRef && Jour.JournalRef.jr_type + '' === '1' ? Jour.j_label : null,
                j_ref: Jour.JournalRef ? Jour.JournalRef.id_data : null,
                PatientId,
              },
              LogedUser,
              SaveLog: true,
            });
          }
        }
      }

      result.Message = ExistingVisit ? 'Амжилттай засварлалаа' : 'Амжилттай хадгаллаа';
      result.Data = { DataId: VisitId, Id: VisitId, IsUpdate: !!ExistingVisit };
      return res.send(JSON.stringify(result));
    } else {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;
    var VisitConfigData = await BaseControllerHelper.GetConfigData('Visit');
    // var JournalConfigData = await BaseControllerHelper.GetConfigData("Journal");
    var ModHelper = new ModelHelper(Models.Visit);
    var RealJournalData = await Models.Journal.GetRealJournalData(PatientId);
    var CustomFields = [
      {
        Name: 'JournalICD',
        Label: 'ICD10',
        Type: 'SingleSelectLoad',
        Config: {
          IdField: 'id_data',
          TextField: 'jr_label',
          MinTextLength: 1,
          SearchUrl: '/CustomDataApi/GetJournalRefData',
        },
      },
      {
        Name: 'OtherJournal',
        Label: 'Treatments, Procedures, Referrals, Major findings',
        Type: 'SingleSelectLoad',
        Config: {
          IdField: 'id_data',
          TextField: 'jr_label',
          MinTextLength: 1,
          SearchUrl: '/CustomDataApi/GetJournalRefData',
        },
      },
    ];
    var Data = VisitConfigData.Fields;
    Data.push(CustomFields);

    result.Option = { Total: 1, FooterData: [] };
    result.Data = {
      Fields: Data,
      Journals: await ModHelper.GetNewObject(RealJournalData),
    };

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetVisitsByPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    var VisitConfigData = await BaseControllerHelper.GetConfigData('Visit');
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;

    var ModHelper = new ModelHelper(Models.Visit);
    if (ObjectName && LogedUser) {
      var ReqOption = BaseControllerHelper.GetCrudRequestData(req);
      var { Data, Option } = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        Option: ReqOption,
      });
      var Visits = ModHelper.GetNewObject(Data);
      for (var i = 0; i < Visits.length; i++) {
        var visit = Visits[i];
        await ModHelper.GetInfoData(visit, VisitConfigData);
        visit = await BaseControllerHelper.BaseSetFiles({
          ConfigData: VisitConfigData,
          Data: visit,
        });
        var PatientId = visit.PatientId;
        var Journals = await Models.Journal.GetJournalData(
          PatientId,
          visit.id_data,
          visit.visit_date
        );
        visit['Journals'] = ModHelper.GetNewObject(Journals);
      }

      result.Data = Visits;
      result.Option = Option;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
