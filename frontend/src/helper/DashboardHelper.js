/**
 * NO LIVE CONSUMER as of the home-rail rebuild - the two dashboard chart
 * components that used this were deleted with the old home page. Kept because
 * spRepCreatePatients / spRepCreateAllVisits are working stored procedures and
 * the only pre-aggregated time series in the system; removing the client is how
 * that capability gets forgotten.
 */
import Helper from "helper";

function DashboardHelper() {}

DashboardHelper.prototype.GetCreateAllVisits = async (ReqData, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Dashboard/GetCreateAllVisits",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

DashboardHelper.prototype.GetCreatePatients = async (ReqData, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Dashboard/GetCreatePatients",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

export default new DashboardHelper();
