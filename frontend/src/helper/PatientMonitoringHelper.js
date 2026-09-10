import Helper from "helper";

function PatientMonitoringHelper() {}

PatientMonitoringHelper.prototype.GetList = async (
  { SearchOption },
  callback,
) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData(
    "PatientMonitoringDoctor",
    SearchOption,
  );
  await Helper.BaseCrudHelper.CallService(
    "/PatientMonitoring/GetList",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

PatientMonitoringHelper.prototype.CheckPatientMonitoring = async (
  PatientId,
  callback,
) => {
  const LogedDoctor = Helper.AuthHelper.GetLogedDoctorLocal();
  if (LogedDoctor) {
    await Helper.BaseCrudHelper.CallService(
      "/PatientMonitoring/CheckPatientMonitoring",
      { DoctorId: LogedDoctor.id_data, PatientId },
      (resData) => callback && callback(resData),
    );
  }
};

PatientMonitoringHelper.prototype.SavePatient = async (Data, callback) => {
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const LogedDoctor = Helper.AuthHelper.GetLogedDoctorLocal();
  if (LogedDoctor && LogedUser) {
    await Helper.BaseCrudHelper.CallService(
      "/PatientMonitoring/SavePatient",
      { ...Data, UserId: LogedUser.Id, DoctorId: LogedDoctor.id_data },
      (resData) => callback && callback(resData),
    );
  }
};

PatientMonitoringHelper.prototype.RemovePatient = async (Data, callback) => {
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const LogedDoctor = Helper.AuthHelper.GetLogedDoctorLocal();
  if (LogedDoctor && LogedUser) {
    await Helper.BaseCrudHelper.CallService(
      "/PatientMonitoring/RemovePatient",
      { ...Data, UserId: LogedUser.Id, DoctorId: LogedDoctor.id_data },
      (resData) => callback && callback(resData),
    );
  }
};

export default new PatientMonitoringHelper();
