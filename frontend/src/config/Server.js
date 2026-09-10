import axios from "axios";
import i18n from "i18n";

const baseURL = "/api";

//  : "backend.telemedicine.mn:443/";
//  : "backendtest.telemedicine.mn:443/";

const Server = axios.create({ baseURL });

Server.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("MnCardioToken");
    if (token && !config.headers?.authorization) {
      config.headers = {
        ...(config.headers || {}),
        authorization: "Bearer " + token,
      };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

Server.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Read the role before clearing, so an expired patient session returns to
      // the patient login rather than the doctor one.
      let LoginPath = "/auth/login";
      try {
        const stored = localStorage.getItem("LogedUser");
        const LogedUser = stored ? JSON.parse(stored) : null;
        if (LogedUser && LogedUser.RoleId + "" === "4") {
          LoginPath = "/patientAuth/login";
        }
      } catch (e) {
        // Corrupt payload - fall back to the staff login.
      }

      localStorage.removeItem("IsLogin");
      localStorage.removeItem("LogedUser");
      localStorage.removeItem("MnCardioToken");
      if (window.location.pathname !== LoginPath) {
        window.location.assign(LoginPath);
      }
    }
    return Promise.reject(error);
  },
);

// Export CancelToken for upload cancellation support
Server.CancelToken = axios.CancelToken;
Server.isCancel = axios.isCancel;

const getToken = function () {
  return localStorage.getItem("MnCardioToken");
};

export default Server;

export { baseURL };

export const call = async ({ url, data, method, token, responseType }) => {
  try {
    if (!token) token = getToken();
    const res = await Server({
      method: method ? method : "POST",
      headers: token ? { authorization: "Bearer " + token } : undefined,
      url: url,
      data: data,
      responseType: responseType || "json",
    });

    return res.data;
  } catch (ex) {
    console.error(ex);
    return { data: null, success: false, message: "Алдаа гарлаа" };
  }
};

export const sleep = async (msec = 3000) => {
  return new Promise((resolve) => setTimeout(resolve, msec));
};
