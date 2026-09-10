import Helper from "helper";

function InPatientHelper() {}

InPatientHelper.prototype.GetDepartmentList = async (DoctorId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Stay/GetDepartments",
    { DoctorId },
    (resData) => callback && callback(resData),
  );
};

export default new InPatientHelper();
