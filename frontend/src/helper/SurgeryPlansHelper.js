import Helper from "helper";

function SurgeryPlansHelper() {}

SurgeryPlansHelper.prototype.CancelPatient = async (
  { SurgeryPlansId },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/SurgeryPlans/CancelPatient",
    { SurgeryPlansId },
    (resData) => callback && callback(resData),
  );
};

SurgeryPlansHelper.prototype.CheckPatient = async (PatientId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/SurgeryPlans/CheckPatient",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

SurgeryPlansHelper.prototype.GetCustomFormData = async (
  PatientId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/SurgeryPlans/GetCustomFormData",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

SurgeryPlansHelper.prototype.CustomSave = async (Data, callback) => {
  const ReqData = { Data: JSON.stringify(Data) };
  await Helper.BaseCrudHelper.CallService(
    "/SurgeryPlans/CustomSave",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

export default new SurgeryPlansHelper();
