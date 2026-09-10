import Helper from "helper";

function FollowUpHelper() {}

FollowUpHelper.prototype.CustomSave = async ({ AdviceId, Data }, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/FollowUp/CustomSave",
    { AdviceId, Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

export default new FollowUpHelper();
