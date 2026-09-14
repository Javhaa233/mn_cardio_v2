import Helper from "helper";

class AuthHelper {
  ChangeLanguage = async (Language) => {
    const LogedUser = this.GetLogedUserLocal();
    // Returns null on an expired or cleared session; without this guard the
    // next line throws and the language toggle dies silently.
    if (!LogedUser) return;
    LogedUser.Language = Language;
    await Helper.BaseCrudHelper.BaseUpdate(
      { ObjectName: "Users", Data: { Id: LogedUser.Id, Language } },
      (resData) => {
        if (resData && resData.Success) {
          localStorage.LogedUser = JSON.stringify(LogedUser);
        }
      },
    );
  };

  CheckRole = (Roles) => {
    try {
      const LogedUser = this.GetLogedUserLocal();
      if (Array.isArray(Roles) && LogedUser && LogedUser.RoleId)
        return Roles.filter((s) => s + "" === LogedUser.RoleId + "").length > 0;
      else return false;
    } catch (ex) {
      process.env.NODE_ENV === "development" && console.log(ex);
      return false;
    }
  };

  GetLogedUserLocal = () => {
    const strData = localStorage.getItem("LogedUser");
    if (strData) return JSON.parse(strData);
    return null;
  };

  GetLogedDoctorLocal = () => {
    const strData = localStorage.getItem("LogedUser");
    const UserData = strData ? JSON.parse(strData) : null;
    if (UserData) return UserData.Doctor;
    return null;
  };

  // --- Own contact details (the post-login prompt) --------------------------
  //
  // `Users.Email` is what password reset mails, and a staff account's only
  // phone is `DoctorsProfile.telephone`. Patients (role 4) never get the prompt:
  // their details come from ХУР/ДАН.

  ShouldCheckContact = () => {
    const LogedUser = this.GetLogedUserLocal();
    if (!LogedUser || !LogedUser.Id || LogedUser.RoleId + "" === "4")
      return false;
    if (this.IsContactPromptSnoozed(LogedUser)) return false;
    const Doctor = LogedUser.Doctor || {};
    return (
      !String(LogedUser.Email || "").trim() ||
      !String(Doctor.telephone || "").trim()
    );
  };

  // "Later" holds until the next login - Login clears it.
  IsContactPromptSnoozed = (LogedUser) => {
    try {
      return (
        !!LogedUser &&
        localStorage.getItem("ContactPromptSnoozed") === String(LogedUser.Id)
      );
    } catch (ex) {
      return false;
    }
  };

  SnoozeContactPrompt = () => {
    const LogedUser = this.GetLogedUserLocal();
    if (LogedUser)
      localStorage.setItem("ContactPromptSnoozed", String(LogedUser.Id));
  };

  // Keeps the stored user in step with the server, so a session saved before
  // `telephone` was sent at login does not look like a missing phone forever.
  StoreContact = (Email, Phone) => {
    const LogedUser = this.GetLogedUserLocal();
    if (!LogedUser) return;
    LogedUser.Email = Email || "";
    LogedUser.Doctor = { ...(LogedUser.Doctor || {}), telephone: Phone || "" };
    if (Email) LogedUser.Doctor.email = Email;
    localStorage.LogedUser = JSON.stringify(LogedUser);
  };

  // After the user edits their own profile: the navbar reads Doctor.firstname.
  StoreDoctorFields = (Fields) => {
    const LogedUser = this.GetLogedUserLocal();
    if (!LogedUser) return;
    LogedUser.Doctor = { ...(LogedUser.Doctor || {}), ...Fields };
    if (Fields.firstname !== undefined) LogedUser.FirstName = Fields.firstname;
    if (Fields.lastname !== undefined) LogedUser.LastName = Fields.lastname;
    localStorage.LogedUser = JSON.stringify(LogedUser);
  };

  // callback(Data | null), Data = { Email, Phone, Missing: { Email, Phone } }
  RefreshContact = async (callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/GetMyContact",
      {},
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          const Data = resData.Data;
          this.StoreContact(Data.Missing.Email ? "" : Data.Email, Data.Phone);
          callback && callback(Data);
        } else {
          callback && callback(null);
        }
      },
    );
  };

  UpdateMyContact = async ({ Email, Phone }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/UpdateMyContact",
      { Email, Phone },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          this.StoreContact(resData.Data.Email, resData.Data.Phone);
        }
        callback && callback(resData);
      },
    );
  };

  GetLogedUserServer = (callback) => {
    const strData = localStorage.getItem("LogedUser");
    callback && callback(JSON.parse(strData));
  };

  ForgetPassword = async ({ UserName }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/ForgetPassword",
      { UserName },
      (resData) => callback && callback(resData),
    );
  };

  ResetPassword = async ({ UserName, Token, Password }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/ResetPassword",
      { UserName, Token, Password },
      (resData) => callback && callback(resData),
    );
  };

  ChangePassword = async ({ NewPassword, Password }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/ChangePassword",
      { Password, NewPassword },
      (resData) => callback && callback(resData),
    );
  };

  Login = async ({ UserName, Password }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/Login",
      { UserName, Password },
      (resData) => {
        if (resData) {
          if (resData.Success) {
            if (resData.Data) {
              localStorage.setItem("IsLogin", "true");
              localStorage.setItem(
                "LogedUser",
                JSON.stringify(resData.Data.LogedUser),
              );
              localStorage.setItem("MnCardioToken", resData.Data.token);
              // A fresh login brings the contact prompt back if still needed.
              localStorage.removeItem("ContactPromptSnoozed");
              callback &&
                callback(
                  true,
                  resData.Data.LogedUser ? resData.Data.LogedUser.RoleId : 0,
                );
            } else {
              callback && callback(false, 0, "An error occurred");
            }
          } else {
            callback &&
              callback(
                false,
                0,
                resData.Message ? resData.Message : "An error occurred",
              );
          }
        }
      },
    );
  };

  PatientLogin = async ({ UserName, Password }, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/PatientUser/Login",
      { UserName, Password },
      (resData) => {
        if (resData) {
          if (resData.Success && resData.Data) {
            localStorage.setItem("IsLogin", "true");
            localStorage.setItem(
              "LogedUser",
              JSON.stringify(resData.Data.LogedUser),
            );
            localStorage.setItem("MnCardioToken", resData.Data.token);
            callback &&
              callback(
                true,
                resData.Data.LogedUser ? resData.Data.LogedUser.RoleId : 4,
              );
          } else {
            callback &&
              callback(
                false,
                0,
                resData.Message ? resData.Message : "An error occurred",
              );
          }
        }
      },
    );
  };

  LogOut = async (callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/User/Logout",
      { Data: {} },
      (resData) => {
        if (resData) {
          if (resData.Success) {
            // Close the live chat stream with the session. Without this an
            // authenticated socket outlives the logout on a shared ward
            // workstation, and the next person at the keyboard keeps receiving
            // the previous doctor's messages.
            Helper.ChatSocketHelper.Disconnect();
            localStorage.setItem("IsLogin", null);
            localStorage.setItem("LogedUser", null);
            localStorage.setItem("MnCardioToken", null);
            callback && callback(true, "");
          } else {
            callback && callback(false, resData.Message);
          }
        }
      },
    );
  };

  PatientLogOut = async (callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/PatientUser/LogOut",
      { Data: {} },
      (resData) => {
        if (resData) {
          if (resData.Success) {
            // See the note in LogOut above.
            Helper.ChatSocketHelper.Disconnect();
            localStorage.setItem("IsLogin", "false");
            localStorage.setItem("LogedUser", "");
            localStorage.setItem("MnCardioToken", "");
            callback && callback(true, "");
          } else {
            callback && callback(false, resData.Message);
          }
        }
      },
    );
  };

  // Нэвтэрсэн хэрэглэгч эсэхийг шалгах
  CheckLogin = async (callback) => {
    await Helper.BaseCrudHelper.CallServiceWithoutAuthError(
      "/User/CheckLogin",
      {},
      (resData) => {
        if (resData && resData.AuthError === true) callback && callback(false);
        else callback && callback(true);
      },
    );
  };

  CheckUserName = async (UserName, callback) => {
    await Helper.BaseCrudHelper.CallService(
      "/UserRequest/CheckUserName",
      { UserName },
      (resData) => callback && callback(resData),
    );
  };
}

export default new AuthHelper();
