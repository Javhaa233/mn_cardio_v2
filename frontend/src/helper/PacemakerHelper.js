import Helper from "helper";

function PacemakerHelper() {}

PacemakerHelper.prototype.CustomSavePacemakerOne = async (
  { ObjectName, Data },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/PacemakerOne/CustomSave",
    { ObjectName, Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

PacemakerHelper.prototype.CustomSavePacemakerTwo = async (
  { ObjectName, Data },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/PacemakerTwo/CustomSave",
    { ObjectName, Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

PacemakerHelper.prototype.CustomSavePacemakerThree = async (
  { ObjectName, Data },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/PacemakerThree/CustomSave",
    { ObjectName, Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

export default new PacemakerHelper();
