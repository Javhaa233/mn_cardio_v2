import Helper from "helper";

function DoctorTeamHelper() {}

DoctorTeamHelper.prototype.GetList = async ({ SearchOption }, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData(
    "DoctorsTeamPatient",
    SearchOption,
  );
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/GetList",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.CheckSurgeryBeforeCheck = async (
  { DoctorsTeamPatientId },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/CheckSurgeryBeforeCheck",
    { DoctorsTeamPatientId },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.GetPatientNotes = async (SearchOption, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData(
    "DoctorsTeamNotes",
    SearchOption,
  );
  await Helper.BaseCrudHelper.CallService(
    "/BaseObject/",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.SavePatientNote = async (Data, callback) => {
  var Doctor = Helper.AuthHelper.GetLogedDoctorLocal();
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  if (LogedUser && Doctor) {
    Data = { ...Data, DoctorId: Doctor.id_data, CreateUserId: LogedUser.Id };
    await Helper.BaseCrudHelper.CallService(
      "/BaseObject/create",
      { ObjectName: "DoctorsTeamNotes", Data: JSON.stringify(Data) },
      (resData) => callback && callback(resData),
    );
  }
};

DoctorTeamHelper.prototype.SaveGeneral = async (Data, callback) => {
  var Action = "/BaseObject/update";
  if (!Data.id_data) {
    delete Data.id_data;
    Action = "/DoctorsTeam/CreateDoctorsTeam";
  }
  await Helper.BaseCrudHelper.CallService(
    "" + Action,
    { ObjectName: "DoctorsTeam", Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.RemoveDoctor = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/RemoveDoctor",
    { Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.SaveDoctor = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/SaveDoctor",
    { ObjectName: "LookupDoctorTeam", Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.SavePatient = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/SavePatient",
    { Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.RemovePatient = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/RemovePatient",
    { Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.GetDoctorsTeams = async (DoctorId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/GetDoctorsTeams",
    { DoctorId },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.GetDoctorsTeamsWithoutPatient = async (
  { DoctorId, PatientId },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/GetDoctorsTeamsWithoutPatient",
    { DoctorId, PatientId },
    (resData) => callback && callback(resData),
  );
};

DoctorTeamHelper.prototype.DeleteDoctorsTeam = async (TeamId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorsTeam/DeleteDoctorsTeam",
    { TeamId },
    (resData) => callback && callback(resData),
  );
};

export default new DoctorTeamHelper();
