const express = require('express');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/CustomSave', CustomSave);
router.post('/CheckPatient', CheckPatient);
router.post('/CancelPatient', CancelPatient);

async function CancelPatient(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: [] };
    const OrderHospitalizationId = req.body.OrderHospitalizationId;
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;
    const OrderHospitalizationObj =
      await Models.OrderHospitalization.findByPk(OrderHospitalizationId);
    if (LogedUser && OrderHospitalizationObj) {
      var Department = await OrderHospitalizationObj.getDrgroupDepartments();
      var JournalRef = await OrderHospitalizationObj.getJournalRef();

      const StayData = {
        department_id: OrderHospitalizationObj.department_id,
        diagnose_admission: JournalRef ? JournalRef.id_data : null,
        p_id: OrderHospitalizationObj.patient_id,
        from_where: OrderHospitalizationObj.where_from,
        p_status: '4',
        date_waiting: ObjectHelper.getDateYMD({
          DateStr: OrderHospitalizationObj.date_creation,
        }),
        doctor_waiting: OrderHospitalizationObj.id,
        doctor_archive: LogedUser.Id,
        date_archive: ObjectHelper.getDateYMD(),
        OrderHospitalizationId: OrderHospitalizationObj.id_data,
      };

      const NewId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'Stay',
        Data: StayData,
        LogedUser,
        SaveLog: true,
      });

      if (NewId) {
        OrderHospitalizationObj.result = 'canceled';
        await OrderHospitalizationObj.save();
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: OrderHospitalizationObj.patient_id,
            UserId: LogedUser.Id,
            DoctorId: Doctor ? Doctor.id_data : null,
            Notes: '"' + Department.name + '" тасагт хэвтүүлэхийг цуцаллаа',
            LinkObjectName: 'Stay',
            LinkObjectId: NewId,
            LogDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });
        return res.send(JSON.stringify(result));
      } else {
        return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };

    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;

    if (Data && LogedUser && Data.patient_id && Data.department_id) {
      let Department = null;
      if (Data.department_id) {
        Department = await Models.DrgroupDepartments.findOne({
          where: { id_data: Data.department_id },
          raw: true,
        });
      }

      const OrderId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'Order',
        Data: { type: '3' },
        LogedUser,
        SaveLog: true,
      });

      if (OrderId) {
        const NewId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'OrderHospitalization',
          Data: {
            ...Data,
            result: 'waiting',
            order_id: OrderId,
            processed: 'n',
            preliminary_disease: Data.ICD10,
          },
          LogedUser,
          SaveLog: true,
        });

        const DepartmentName = Department ? Department.name : '';
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: Data.patient_id,
            UserId: LogedUser.Id,
            DoctorId: Doctor ? Doctor.id_data : null,
            Notes: '"' + DepartmentName + '" тасагт хэвтүүлэхээр хүсэлт илгээлээ',
            LinkObjectName: 'OrderHospitalization',
            LinkObjectId: NewId,
            LogDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });

        result.Data = { DataId: OrderId };
        return res.send(JSON.stringify(result));
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Data not found'))
        );
      }
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };
    const PatientId = req.body.PatientId;
    const ConfigData = await BaseControllerHelper.GetConfigData('OrderHospitalization');
    const Patient = await Models.Patient.findByPk(PatientId);

    let Journals = await Models.Journal.GetRealJournalData(PatientId);
    Journals = JSON.parse(JSON.stringify(Journals));
    Journals = Journals.filter((s) => s.JournalRef.jr_type + '' === '5');

    const JournalRefs = [];
    const CustomFields = [];
    for (let i = 0; i < Journals.length; i++) {
      JournalRefs.push(Journals[i].JournalRef);
    }

    CustomFields.push({
      Name: 'ICD10',
      Label: 'ICD10',
      Type: 'SingleSelect',
      Config: { IdField: 'id_data', TextField: 'jr_label' },
      Data: JournalRefs,
    });

    var PatientPhone = null;
    if (Patient) {
      PatientPhone = Patient.p_telephone;
    }

    if (Array.isArray(ConfigData.Fields) && CustomFields.length > 0) {
      ConfigData.Fields.push([CustomFields]);
    }

    result.Data.Fields = ConfigData.Fields;
    result.Data.CustomFields = CustomFields;
    result.Data.PatientPhone = PatientPhone;

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckPatient(req, res) {
  try {
    var result = {
      Success: true,
      Message: '',
      Data: { Check: false, Text: '' },
      Option: {},
    };
    const { PatientId } = req.body;

    let DisableText = '';
    if (PatientId) {
      let OrderHospitalizations = await Models.OrderHospitalization.findAll({
        where: { patient_id: PatientId, result: 'waiting' },
        include: [
          {
            model: Models.DrgroupDepartments,
            as: 'DrgroupDepartments',
            attributes: ['name', 'id_data'],
            include: [{ model: Models.Organization, as: 'Organization' }],
          },
        ],
      });
      OrderHospitalizations = JSON.parse(JSON.stringify(OrderHospitalizations));
      if (OrderHospitalizations.length === 0) {
        let InpatientDepsPatientss = await Models.Stay.findAll({
          where: {
            p_id: PatientId,
            mode_discharge: { [Op.eq]: null },
            p_status: '2',
          },
          include: [
            {
              model: Models.DrgroupDepartments,
              as: 'DrgroupDepartments',
              attributes: ['name', 'id_data'],
              include: [{ model: Models.Organization, as: 'Organization' }],
            },
          ],
        });
        InpatientDepsPatientss = JSON.parse(JSON.stringify(InpatientDepsPatientss));

        if (InpatientDepsPatientss.length === 0) {
          result.Data = { Check: true };
        } else {
          if (InpatientDepsPatientss[0].DrgroupDepartments) {
            DisableText += InpatientDepsPatientss[0].DrgroupDepartments
              ? InpatientDepsPatientss[0].DrgroupDepartments.name
              : '';

            DisableText += InpatientDepsPatientss[0].DrgroupDepartments.Organization
              ? ' /' +
                InpatientDepsPatientss[0].DrgroupDepartments.Organization.Name +
                '/' +
                ' -т хэвтэн эмчлүүлж байна'
              : '';
          }
          result.Data.Text = DisableText;
        }
      } else {
        if (OrderHospitalizations[0].DrgroupDepartments) {
          DisableText += OrderHospitalizations[0].DrgroupDepartments
            ? OrderHospitalizations[0].DrgroupDepartments.name
            : '';

          DisableText += OrderHospitalizations[0].DrgroupDepartments.Organization
            ? ' /' +
              OrderHospitalizations[0].DrgroupDepartments.Organization.Name +
              '/' +
              ' -т хэвтэх хүсэлт илгээсэн байна'
            : '';
        }
        result.Data.Text = DisableText;
      }

      return res.send(JSON.stringify(result));
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

module.exports = router;
