import Helper from "helper";

function StayHelper() {}

StayHelper.prototype.CustomSave = async (
  { OrderHospitalizationId },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/Stay/CustomSave",
    { OrderHospitalizationId },
    (resData) => callback && callback(resData),
  );
};

export default new StayHelper();
