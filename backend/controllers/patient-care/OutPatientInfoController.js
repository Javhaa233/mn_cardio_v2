const express = require('express');
const { newPage } = require('../../helper/BrowserPool');
const { GetOrganizationLogo } = require('../../helper/PrintHelper');
const fs = require('fs');
const router = express.Router();
const os = require('os');
const path = require('path');

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

const OutPatientInfoReport = require('../../reports/OutPatientInfo');

// routes
router.post('/PrintReport', PrintReport);
router.post('/PrintByStayId', PrintByStayId);
router.post('/GetLastOutPatientInfoId', GetLastOutPatientInfoId);
router.post('/GetPatientPlainPassword', GetPatientPlainPassword);
router.post('/UpdateStayDates', UpdateStayDates);

// Returns a copy of InPatientInfo with the admission/discharge dates replaced by
// the values the doctor typed before printing. Display-only: it does not touch
// the password-expiry calculation, which still uses the real Stay dates.
function ApplyDateOverrides(InPatientInfo, DateAdmission, DateDischarge) {
  if (!InPatientInfo || (!DateAdmission && !DateDischarge)) return InPatientInfo;
  return {
    ...InPatientInfo,
    date_admission: DateAdmission || InPatientInfo.date_admission,
    date_discharge: DateDischarge || InPatientInfo.date_discharge,
  };
}

async function GetReportData(Id, LogedUser) {
  const OutPatientInfoConfigData = await BaseControllerHelper.GetConfigData('OutPatientInfo');
  const ModHelper = new ModelHelper(Models.OutPatientInfo);
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const { Data } = await BaseControllerHelper.BaseGetList({
    ObjectName: 'OutPatientInfo',
    LogedUser,
    Option,
  });

  const OutPatientInfos = ModHelper.GetNewObject(Data);
  let RandomPassword = null;
  let PatientData = null;
  let InPatientInfo = null;
  let DischargeDate = new Date();
  let OrganizationLogo = null;

  // Get Organization Logo from logged user's doctor profile
  if (LogedUser && LogedUser.Doctor && LogedUser.Doctor.OrganizationId) {
    OrganizationLogo = await GetOrganizationLogo(LogedUser.Doctor.OrganizationId);
  }

  for (var i = 0; i < OutPatientInfos.length; i++) {
    var outPatientInfo = OutPatientInfos[i];
    await ModHelper.GetInfoData(outPatientInfo, OutPatientInfoConfigData);

    const PatientId = outPatientInfo.PatientId;
    const StayId = outPatientInfo.StayId;

    // Get Patient Data
    PatientData = await Models.Patient.findByPk(PatientId, {
      attributes: [
        'id_data',
        'p_registration',
        'p_firstname',
        'p_lastname',
        'p_birthday',
        'p_gender',
        'user_id',
      ],
    });

    // Get Patient gender object
    if (PatientData && PatientData.p_gender) {
      const genderConfig = OutPatientInfoConfigData.Fields.find((f) => f.Name === 'p_gender');
      if (genderConfig && genderConfig.Data) {
        PatientData.dataValues.p_genderObj = genderConfig.Data.find(
          (d) => d.Value + '' === PatientData.p_gender + ''
        );
      }
    }

    // Get Stay/InPatient Info
    if (StayId) {
      InPatientInfo = await Models.Stay.findByPk(StayId, {
        include: [
          {
            model: Models.DrgroupDepartments,
            as: 'DrgroupDepartments',
            attributes: ['id', 'name'],
          },
        ],
      });
      if (InPatientInfo && InPatientInfo.date_discharge) {
        DischargeDate = new Date(InPatientInfo.date_discharge);
      }
    }

    // Password Random String Create
    RandomPassword = Math.random().toString(36).substr(2, 8);

    if (PatientData) {
      var PatientUserId = PatientData.user_id;

      if (PatientUserId) {
        await BaseControllerHelper.BaseUpdate({
          ObjectName: 'PatientUsers',
          Data: {
            Id: PatientUserId,
            Password: RandomPassword,
            PassExpireDate: ObjectHelper.getDateYMD({
              Date: new Date(DischargeDate.setMonth(DischargeDate.getMonth() + 6)),
            }),
          },
          LogedUser,
          SaveLog: true,
        });
        // Reset DischargeDate for expiry calculation
        DischargeDate =
          InPatientInfo && InPatientInfo.date_discharge
            ? new Date(InPatientInfo.date_discharge)
            : new Date();
      } else {
        const CreateResult = await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientUsers',
          Data: {
            UserName: PatientData.p_registration,
            LastName: PatientData.p_lastname,
            FirstName: PatientData.p_firstname,
            Password: RandomPassword,
            PassExpireDate: ObjectHelper.getDateYMD({
              Date: new Date(DischargeDate.setMonth(DischargeDate.getMonth() + 6)),
            }),
            Email: null,
            UserTypeId: 3,
            IsActive: '1',
            RoleId: '4',
            Language: 'en',
          },
          LogedUser,
          SaveLog: true,
        });
        await Models.Patient.update({ user_id: CreateResult }, { where: { id_data: PatientId } });
        // Reset DischargeDate for expiry calculation
        DischargeDate =
          InPatientInfo && InPatientInfo.date_discharge
            ? new Date(InPatientInfo.date_discharge)
            : new Date();
      }
    }
  }

  return {
    Data: OutPatientInfos[0],
    PatientData: PatientData ? PatientData.dataValues : null,
    InPatientInfo: InPatientInfo ? InPatientInfo.dataValues : null,
    Password: RandomPassword,
    DischargeDate:
      InPatientInfo && InPatientInfo.date_discharge
        ? new Date(InPatientInfo.date_discharge)
        : new Date(),
    OrganizationLogo,
  };
}

async function PrintReport(req, res) {
  try {
    const reportDir = process.env.REPORT_DIR;
    console.log('PrintReport - REPORT_DIR:', reportDir);

    if (!fs.existsSync(reportDir)) {
      try {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log(`Created REPORT_DIR: ${reportDir}`);
      } catch (mkdirErr) {
        console.error(`Failed to create REPORT_DIR: ${reportDir}`, mkdirErr);
        return res
          .status(500)
          .json(BaseControllerHelper.GetDefaultErrorResult('REPORT_DIR creation failed'));
      }
    }

    const LogedUser = req.LogedUser;
    const { Id, DateAdmission, DateDischarge } = req.body;

    if (!LogedUser || !Id) {
      return res
        .status(400)
        .json(BaseControllerHelper.GetDefaultErrorResult('Information is missing'));
    }

    const options = {
      format: 'A4',
      orientation: 'portrait',
      dpi: 200,
      quality: 80,
      header: { height: '8mm' },
      footer: { height: '8mm' },
      type: 'pdf',
    };

    const { Data, PatientData, InPatientInfo, Password, DischargeDate, OrganizationLogo } =
      await GetReportData(Id, LogedUser);

    console.log({ Password });

    const html = OutPatientInfoReport(
      Data,
      PatientData,
      ApplyDateOverrides(InPatientInfo, DateAdmission, DateDischarge),
      Password,
      DischargeDate,
      OrganizationLogo
    );

    // Use unique filename to avoid conflicts with concurrent requests
    const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileName = `OutPatientInfo_${uniqueId}.pdf`;
    // Ensure absolute path for res.sendFile
    const filePath = path.isAbsolute(reportDir)
      ? path.join(reportDir, fileName)
      : path.resolve(process.cwd(), reportDir, fileName);

    // `page` is hoisted so the finally below can always close it. It used to be
    // declared inside the try and never closed on ANY path, including the catch
    // that re-throws - one leaked Chromium tab per print, until the pool ran out.
    let page = null;
    try {
      page = await newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: options.header.height,
          bottom: options.footer.height,
        },
      });

      // Check if file was created successfully
      if (!fs.existsSync(filePath)) {
        throw new Error('PDF file was not created');
      }

      // Verify PDF file size is reasonable (should be > 1KB for a valid PDF)
      const stats = fs.statSync(filePath);
      console.log(`PDF file size: ${stats.size} bytes`);

      if (stats.size < 1024) {
        console.error(
          'WARNING: PDF file is suspiciously small (< 1KB). This may indicate a rendering issue.'
        );
      }

      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="OutPatientInfo.pdf"');
      return res.sendFile(filePath, (err) => {
        // Clean up the temporary file after sending
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      throw puppeteerError;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (ex) {
          console.error('Failed to close Puppeteer page:', ex);
        }
      }
    }
  } catch (ex) {
    console.error('PrintReport error:', ex);
    return res
      .status(500)
      .json(BaseControllerHelper.GetDefaultErrorResult(ex.message || 'Internal server error'));
  }
}

async function GetLastOutPatientInfoId(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null };
    const { StayId } = req.body;
    const LogedUser = req.LogedUser;

    if (LogedUser && StayId) {
      const outPatientInfo = await Models.OutPatientInfo.findOne({
        where: { StayId },
        order: [['Id', 'DESC']],
        attributes: ['Id'],
      });

      if (outPatientInfo) {
        result.Data = { DataId: outPatientInfo.Id };
      }
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function PrintByStayId(req, res) {
  try {
    const reportDir = process.env.REPORT_DIR;
    console.log('PrintByStayId - REPORT_DIR:', reportDir);

    if (!fs.existsSync(reportDir)) {
      try {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log(`Created REPORT_DIR: ${reportDir}`);
      } catch (mkdirErr) {
        console.error(`Failed to create REPORT_DIR: ${reportDir}`, mkdirErr);
        return res
          .status(500)
          .json(BaseControllerHelper.GetDefaultErrorResult('REPORT_DIR creation failed'));
      }
    }

    const LogedUser = req.LogedUser;
    const { StayId, DateAdmission, DateDischarge } = req.body;

    if (!LogedUser || !StayId) {
      return res.status(400).json(BaseControllerHelper.GetDefaultErrorResult('StayId is required'));
    }

    // Get Stay/InPatientInfo to extract PatientId
    const InPatientInfo = await Models.Stay.findByPk(StayId, {
      include: [
        {
          model: Models.DrgroupDepartments,
          as: 'DrgroupDepartments',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!InPatientInfo) {
      return res
        .status(404)
        .json(BaseControllerHelper.GetDefaultErrorResult('Stay/InPatientInfo not found'));
    }

    // Stay model uses 'p_id' field for patient reference
    const PatientId = InPatientInfo.p_id || InPatientInfo.PatientId;
    if (!PatientId) {
      console.error('Stay record fields:', Object.keys(InPatientInfo.dataValues || InPatientInfo));
      return res
        .status(400)
        .json(BaseControllerHelper.GetDefaultErrorResult('PatientId not found in Stay record'));
    }

    // Check if OutPatientInfo exists for this StayId
    const existingOutPatientInfo = await Models.OutPatientInfo.findOne({
      where: { StayId },
      order: [['Id', 'DESC']],
    });

    let outPatientInfoId = null;
    let reportData = null;

    if (existingOutPatientInfo) {
      // Use existing OutPatientInfo
      outPatientInfoId = existingOutPatientInfo.Id;
      reportData = await GetReportData(outPatientInfoId, LogedUser);
    } else {
      // No OutPatientInfo exists - create minimal report data without DB insertion
      console.log(
        `No OutPatientInfo found for StayId: ${StayId}. Generating report with Stay/Patient data only.`
      );

      // Get Patient Data
      const PatientData = await Models.Patient.findByPk(PatientId, {
        attributes: [
          'id_data',
          'p_registration',
          'p_firstname',
          'p_lastname',
          'p_birthday',
          'p_gender',
          'user_id',
        ],
      });

      // Get Patient gender object from config
      if (PatientData && PatientData.p_gender) {
        const OutPatientInfoConfigData = await BaseControllerHelper.GetConfigData('OutPatientInfo');
        const genderConfig = OutPatientInfoConfigData.Fields.find((f) => f.Name === 'p_gender');
        if (genderConfig && genderConfig.Data) {
          PatientData.dataValues.p_genderObj = genderConfig.Data.find(
            (d) => d.Value + '' === PatientData.p_gender + ''
          );
        }
      }

      // Create minimal data object for report (no DB insert)
      reportData = {
        Data: {
          Id: null,
          StayId,
          PatientId,
          Diagnosis: '',
          HiigdsenShinjilgee: '',
          HiigdsenEmchilgee: '',
          LifeAdviceSelectObj: [],
          LifeAdviceOther: '',
          MonitoringSelectObj: [],
          MonitoringOther: '',
          UuhEmSelectObj: [],
          UuhEm: '',
          CreateDate: new Date().toISOString(),
        },
        PatientData: PatientData ? PatientData.dataValues : null,
        InPatientInfo: InPatientInfo.dataValues,
        Password: Math.random().toString(36).substr(2, 8),
        DischargeDate: InPatientInfo.date_discharge
          ? new Date(InPatientInfo.date_discharge)
          : new Date(),
        OrganizationLogo: await GetOrganizationLogo(
          LogedUser.Doctor?.OrganizationId || LogedUser.Doctor?.Organization?.Id
        ),
      };
    }

    // Now print using the report data
    const options = {
      format: 'A4',
      orientation: 'portrait',
      dpi: 200,
      quality: 80,
      header: { height: '8mm' },
      footer: { height: '8mm' },
      type: 'pdf',
    };

    const {
      Data,
      PatientData,
      InPatientInfo: StayInfo,
      Password,
      DischargeDate,
      OrganizationLogo,
    } = reportData;

    console.log('PrintByStayId - Report data:', {
      hasData: !!Data,
      hasPatientData: !!PatientData,
      hasStayInfo: !!StayInfo,
      StayId,
      PatientId,
      OutPatientInfoId: outPatientInfoId || 'N/A (no DB record)',
    });

    const html = OutPatientInfoReport(
      Data,
      PatientData,
      ApplyDateOverrides(StayInfo, DateAdmission, DateDischarge),
      Password,
      DischargeDate,
      OrganizationLogo
    );

    console.log(`Generated HTML length: ${html.length} characters`);

    // Use unique filename to avoid conflicts with concurrent requests
    const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileName = `OutPatientInfo_${uniqueId}.pdf`;
    // Ensure absolute path for res.sendFile
    const filePath = path.isAbsolute(reportDir)
      ? path.join(reportDir, fileName)
      : path.resolve(process.cwd(), reportDir, fileName);

    // `page` is hoisted so the finally below can always close it. It used to be
    // declared inside the try and never closed on ANY path, including the catch
    // that re-throws - one leaked Chromium tab per print, until the pool ran out.
    let page = null;
    try {
      page = await newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: options.header.height,
          bottom: options.footer.height,
        },
      });

      // Check if file was created successfully
      if (!fs.existsSync(filePath)) {
        throw new Error('PDF file was not created');
      }

      // Verify PDF file size is reasonable (should be > 1KB for a valid PDF)
      const stats = fs.statSync(filePath);
      console.log(`PDF file size: ${stats.size} bytes`);

      if (stats.size < 1024) {
        console.error(
          'WARNING: PDF file is suspiciously small (< 1KB). This may indicate a rendering issue.'
        );
      }

      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="OutPatientInfo.pdf"');
      return res.sendFile(filePath, (err) => {
        // Clean up the temporary file after sending
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      throw puppeteerError;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (ex) {
          console.error('Failed to close Puppeteer page:', ex);
        }
      }
    }
  } catch (ex) {
    console.error('PrintByStayId error:', ex);
    return res
      .status(500)
      .json(BaseControllerHelper.GetDefaultErrorResult(ex.message || 'Internal server error'));
  }
}

// Issues a fresh login credential for a patient so the discharge report can hand
// it to them on paper. It rotates the password on every call by design - the
// printed sheet is the only copy.
//
// This used to check nothing but "is someone logged in". It sits in the
// protected route group, which means any valid token - including a patient's own
// role-4 token - could pass an arbitrary PatientId, receive that patient's
// username and password, and reset it in the process. Iterating PatientId was
// therefore account takeover of the entire patient population.
// TRANSITIONAL - patients will move to DAN (national digital identity) with no
// password at all; see the plan's "Authentication: DAN + HUR" decision of
// 2026-09-08. Kept working so the current flow is not broken, but do not
// invest further here: this whole path retires when DAN lands.
async function GetPatientPlainPassword(req, res) {
  try {
    const { PatientId } = req.body;
    const LogedUser = req.LogedUser;
    if (!LogedUser || !PatientId) {
      return res.json({ Success: false, Data: null });
    }

    // Clinical staff only. A patient must never be able to reach this, for
    // their own account or anyone else's.
    if (parseInt(LogedUser.RoleId) === 4) {
      return res.json({
        Success: false,
        Message: 'Энэ үйлдлийг гүйцэтгэх эрхгүй байна',
        Data: null,
      });
    }

    const patient = await Models.Patient.findByPk(PatientId, {
      attributes: ['user_id'],
      raw: true,
    });

    if (!patient || !patient.user_id) {
      return res.json({ Success: true, Data: null });
    }

    const user = await Models.PatientUsers.findByPk(patient.user_id, {
      attributes: ['Id', 'UserName'],
      raw: true,
    });

    if (!user) {
      return res.json({ Success: true, Data: null });
    }

    // Handing out a credential is a sensitive act; leave a trail of who did it.
    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: 'Patient',
      LinkObjectId: PatientId,
      Action: 'IssueCredential',
      LogedUser,
      Notes: 'Issued patient login credential for the discharge report',
      NotesMn: 'Эмнэлгээс гарах хуудсанд өвчтөний нэвтрэх эрх олгов',
    });

    const bcrypt = require('bcryptjs');
    const newPassword = Math.random().toString(36).substr(2, 8);
    const hashed = await bcrypt.hash(newPassword, 8);

    // Only the hash is stored. The cleartext lives in this response and on the
    // printed sheet - nowhere else.
    await Models.PatientUsers.update({ Password: hashed }, { where: { Id: user.Id } });

    return res.json({
      Success: true,
      Data: { UserName: user.UserName, PlainPassword: newPassword },
    });
  } catch (ex) {
    console.error('GetPatientPlainPassword error:', ex);
    return res.json(BaseControllerHelper.GetDefaultErrorResult());
  }
}

// Persists the doctor's edited admission/discharge dates from the printable
// report back onto the Stay (hospitalization) record.
async function UpdateStayDates(req, res) {
  try {
    const LogedUser = req.LogedUser;
    const { StayId, DateAdmission, DateDischarge } = req.body;

    if (!LogedUser || !StayId) {
      return res.json({ Success: false, Message: 'StayId is required', Data: null });
    }

    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    const update = {};
    if (DateAdmission && dateRe.test(DateAdmission)) update.date_admission = DateAdmission;
    if (DateDischarge && dateRe.test(DateDischarge)) update.date_discharge = DateDischarge;

    if (Object.keys(update).length === 0) {
      return res.json({ Success: true, Message: 'No valid dates to update', Data: null });
    }

    await Models.Stay.update(update, { where: { id_data: StayId } });

    return res.json({ Success: true, Message: 'Updated', Data: update });
  } catch (ex) {
    console.error('UpdateStayDates error:', ex);
    return res.json(BaseControllerHelper.GetDefaultErrorResult());
  }
}

module.exports = router;
