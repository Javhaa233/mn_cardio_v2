const express = require('express');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/GetDepartments', GetDepartments);
router.post('/CustomSave', CustomSave);
router.post('/LeavePatient', LeavePatient);

async function GetDepartments(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };

    const DoctorId = req.body.DoctorId;
    const LogedUser = req.LogedUser;

    if (!LogedUser) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const RoleId = parseInt(LogedUser.RoleId);

    if (!DoctorId || RoleId === 1) {
      // Admin or no doctor: return all departments
      let departments = await Models.DrgroupDepartments.findAllNew({});
      result.Data = JSON.parse(JSON.stringify(departments));
      return res.send(JSON.stringify(result));
    }

    const DoctorTooDepartments = await Models.DoctorTooDepartment.findAll({
      where: { DoctorId },
      raw: true,
    });
    if (DoctorTooDepartments && DoctorTooDepartments.length > 0) {
      const DepartmentIds = DoctorTooDepartments.map((row) => row.DepartmentId + '');
      let departments = await Models.DrgroupDepartments.findAllNew({
        where: { id_data: { [Op.in]: DepartmentIds } },
      });
      result.Data = JSON.parse(JSON.stringify(departments));
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CustomSave(req, res) {
  var result = { Success: true, Message: 'Successfully saved', Data: {} };

  try {
    const OrderHospitalizationId = req.body.OrderHospitalizationId;
    const LogedUser = req.LogedUser;

    const Doctor = LogedUser.Doctor;
    if (!Doctor) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
      );
    }
    const OrderHospitalizationObj =
      await Models.OrderHospitalization.findByPk(OrderHospitalizationId);

    if (OrderHospitalizationObj) {
      var Department = await OrderHospitalizationObj.getDrgroupDepartments();
      var JournalRef = await OrderHospitalizationObj.getJournalRef();

      const StayData = {
        department_id: OrderHospitalizationObj.department_id,
        diagnose_admission: JournalRef ? JournalRef.id_data : null,
        mode_admission: OrderHospitalizationObj.patient_from,
        p_id: OrderHospitalizationObj.patient_id,
        from_where: OrderHospitalizationObj.where_from,
        p_status: '2',
        date_admission: ObjectHelper.getDateYMD(),
        date_waiting: ObjectHelper.getDateYMD({
          DateStr: OrderHospitalizationObj.date_creation,
        }),
        severity_admission: OrderHospitalizationObj.p_severity,
        doctor_waiting: OrderHospitalizationObj.id,
        doctor_admission: LogedUser.Id,
        OrderHospitalizationId: OrderHospitalizationObj.id_data,
      };

      const NewId = await BaseControllerHelper.BaseCreate({
        ObjectName: 'Stay',
        Data: StayData,
        LogedUser,
        SaveLog: true,
      });

      if (NewId) {
        //update
        OrderHospitalizationObj.result = 'admitted';
        await OrderHospitalizationObj.save();
        await BaseControllerHelper.BaseCreate({
          ObjectName: 'PatientHistory',
          Data: {
            PatientId: OrderHospitalizationObj.patient_id,
            UserId: LogedUser.Id,
            DoctorId: Doctor.id_data,
            Notes: '"' + Department.name + '" тасагт хэвтлээ',
            LinkObjectName: 'Stay',
            LinkObjectId: NewId,
            LogDate: ObjectHelper.getDateYMDHMS(),
          },
          LogedUser,
        });

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

async function LeavePatient(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully released', Data: [] };
    const Data = req.body;
    const LogedUser = req.LogedUser;
    const Doctor = LogedUser.Doctor;
    if (!Doctor) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
      );
    }

    if (!Data) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Data is not found'))
      );
    }

    const StayObj = await Models.Stay.findByPk(Data.StayId);

    if (StayObj) {
      const Department = await StayObj.getDrgroupDepartments();
      //set values
      StayObj.diagnose_discharge = Data.diagnose_discharge;
      StayObj.to_where = Data.to_where;
      StayObj.to_department = Data.to_department;
      StayObj.RefferalTo = Data.RefferalTo;
      StayObj.mode_discharge = '1';
      StayObj.date_discharge = ObjectHelper.getDateYMD();
      StayObj.doctor_discharge = LogedUser.Id;
      StayObj.p_status = '3';
      StayObj.date_archive = ObjectHelper.getDateYMD();
      StayObj.doctor_archive = LogedUser.Id;
      const StayId = await StayObj.save();

      await BaseControllerHelper.BaseCreate({
        ObjectName: 'PatientHistory',
        Data: {
          PatientId: StayObj.p_id,
          UserId: LogedUser.Id,
          DoctorId: Doctor.id_data,
          Notes: '"' + Department.name + '" тасгаас гарлаа',
          LinkObjectName: 'Stay',
          LinkObjectId: StayObj.id_data,
          LogDate: ObjectHelper.getDateYMDHMS(),
        },
        LogedUser,
      });
      result.Data = { DataId: StayId };
      return res.send(JSON.stringify(result));
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

module.exports = router;
