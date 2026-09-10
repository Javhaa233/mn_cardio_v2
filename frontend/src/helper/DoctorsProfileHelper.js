import Helper from "helper";

function DoctorsProfileHelper() {}

DoctorsProfileHelper.prototype.GetDoctorsProfileInfoByUserId = async (
  UserId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorProfile/GetByUserId",
    { UserId },
    (resData) => callback && callback(resData),
  );
};

DoctorsProfileHelper.prototype.GetDoctorsProfileInfo = async (
  DoctorId,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorProfile/GetDoctorsProfileInfo",
    { DoctorId },
    (resData) => callback && callback(resData),
  );
};

DoctorsProfileHelper.prototype.ChangePassword = async (ReqData, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/DoctorProfile/ChangePassword",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

export default new DoctorsProfileHelper();
