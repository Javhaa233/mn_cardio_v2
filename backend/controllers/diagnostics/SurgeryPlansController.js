const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ConfigSheetHelper = require('../../helper/ConfigSheetHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/get-list', getList);
router.post('/GetCustomFormData', GetCustomFormData);
router.post('/CustomSave', CustomSave);
router.post('/cancel-patient', CancelPatient);
router.post('/PrintReport', PrintReport);

async function getList(req, res) {
  var result = { Success: true, Message: '', Data: [], Option: {} };
  try {
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CancelPatient(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: [] };
    const SurgeryPlansId = req.body.SurgeryPlansId;
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;
    if (!Doctor) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
      );
    }
    const SurgeryPlansObj = await Models.SurgeryPlans.findByPk(SurgeryPlansId);
    if (LogedUser && SurgeryPlansObj) {
      var Department = await SurgeryPlansObj.getDrgroupDepartments();

      const Data = {
        department_id: SurgeryPlansObj.department_id,
        PatRegNo: SurgeryPlansObj.PatRegNo,
        from_where: SurgeryPlansObj.where_from,
        p_status: '4',
        date_waiting: ObjectHelper.getDateYMD({
          DateStr: SurgeryPlansObj.date_creation,
        }),
        doctor_waiting: SurgeryPlansObj.id,
        doctor_archive: LogedUser.Id,
        date_archive: ObjectHelper.getDateYMD(),
        SurgeryPlansId: SurgeryPlansObj.id_data,
      };

      const NewId = await BaseControllerHelper.BaseUpdate({
        ObjectName: 'SurgeryPlans',
        Data,
        LogedUser,
        SaveLog: true,
      });

      if (NewId) {
        SurgeryPlansObj.result = 'canceled';
        await SurgeryPlansObj.save();
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: SurgeryPlansObj.patient_id,
            UserId: LogedUser.Id,
            DoctorId: Doctor.id_data,
            Notes: 'Мэс заслын төлөвлөгөөг цуцаллаа',
            LinkObjectName: 'SurgeryPlans',
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

async function GetCustomFormData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };

    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;
    if (!Doctor) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
      );
    }

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
          ObjectName: 'SurgeryPlans',
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
            DoctorId: Doctor.id_data,
            Notes: '"' + DepartmentName + '" мэс заслын төлөвлөгөөнд орууллаа',
            LinkObjectName: 'SurgeryPlans',
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

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (!LogedUser || !Id) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const Sheet = await ConfigSheetHelper.PrintObject({
      res,
      ObjectName: 'SurgeryPlans',
      Id,
      LogedUser,
    });
    if (!Sheet) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Маягтын тохиргоо олдсонгүй'))
      );
    }
    return Sheet;
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
