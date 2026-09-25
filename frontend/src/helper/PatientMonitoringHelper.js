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
      (resData) => {
        if (resData && resData.Success) {
          window.dispatchEvent(
            new CustomEvent("mncardio:monitoring-changed", {
              detail: { PatientId: Data && Data.PatientId },
            }),
          );
        }
        callback && callback(resData);
      },
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
      (resData) => {
        if (resData && resData.Success) {
          window.dispatchEvent(
            new CustomEvent("mncardio:monitoring-changed", {
              detail: { PatientId: Data && Data.PatientId },
            }),
          );
        }
        callback && callback(resData);
      },
    );
  }
};

// Everyone monitoring this patient: [{UserId, Name, OrganizationName, Since, IsMe}].
// Drives the patient-card banner (MonitoringBanner.jsx).
PatientMonitoringHelper.prototype.GetPatientMonitors = async (
  PatientId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/PatientMonitoring/GetPatientMonitors",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

// SavePatient / RemovePatient fire "mncardio:monitoring-changed" on success:
// the banner and the "Transfer, Monitoring" menu both listen, so taking the
// patient in one place updates the other without a reload.

export default new PatientMonitoringHelper();
