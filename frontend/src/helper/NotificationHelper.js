import Helper from "helper";

function NotificationHelper() {}

NotificationHelper.prototype.GetListData = async (SearchOption, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData(
    "Notification",
    SearchOption,
  );
  await Helper.BaseCrudHelper.CallService(
    "/Notification/GetListData",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

NotificationHelper.prototype.Seen = async (Data, callback) => {
  if (!Data.Seen) {
    await Helper.BaseCrudHelper.BaseUpdate(
      {
        ObjectName: "Notification",
        Data: {
          Id: Data.Id,
          SeenDate: Helper.ObjectHelper.getDateYMDHMS(),
          Seen: "1",
        },
      },
      () => {},
    );
  }
  callback && callback();
};

export default new NotificationHelper();
