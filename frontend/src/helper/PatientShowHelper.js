import Helper from "helper";

function PatientShowHelper() {}

PatientShowHelper.prototype.SearchPatient = async (Option, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData("Patient", Option);
  await Helper.BaseCrudHelper.CallService(
    "/Patient/SearchPatient",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

PatientShowHelper.prototype.GetVisits = async (Option, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData("Visit", Option);
  await Helper.BaseCrudHelper.CallService(
    "/Visit/GetVisitsByPatient",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

PatientShowHelper.prototype.GetPatientInfoById = async (
  PatientId,
  callback,
) => {
  const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  SearchOption.SearchField = [
    { Field: "id_data", Value: PatientId, Op: "Equals" },
  ];
  await Helper.BaseCrudHelper.BaseGetDetailInfo(
    { ObjectName: "Patient", SearchOption },
    (resData) => callback && callback(resData),
  );
};

export default new PatientShowHelper();
