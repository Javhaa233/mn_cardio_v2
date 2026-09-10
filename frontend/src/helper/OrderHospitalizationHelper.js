import Helper from "helper";

function OrderHospitalizationHelper() {}

OrderHospitalizationHelper.prototype.CancelPatient = async (
  { OrderHospitalizationId },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/OrderHospitalization/CancelPatient",
    { OrderHospitalizationId },
    (resData) => callback && callback(resData),
  );
};

OrderHospitalizationHelper.prototype.CheckPatient = async (
  PatientId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/OrderHospitalization/CheckPatient",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

OrderHospitalizationHelper.prototype.GetCustomFormData = async (
  PatientId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/OrderHospitalization/GetCustomFormData",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

OrderHospitalizationHelper.prototype.CustomSave = async (Data, callback) => {
  const ReqData = { Data: JSON.stringify(Data) };
  await Helper.BaseCrudHelper.CallService(
    "/OrderHospitalization/CustomSave",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

export default new OrderHospitalizationHelper();
