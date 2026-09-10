import i18n from "i18n";
import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "system",
  initialState: {
    loading: false,
    alert: { type: "", title: "", at: "", duration: 100, onScreen: false },
    hideNav: false,
    title: "",
    // Page tabs used to live here as eight fixed slots (tab0..tab7) plus an
    // activeMenu, with nothing dispatching them. They are now their own slice,
    // `store/reducers/system/tabs.js`, keyed by pathname+query and unbounded.
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setTitle: (state, { payload }) => {
      state.title = payload;
    },
    setNotify: (state, { payload }) => {
      state.alert = payload;
    },
    setAlert: (state, { payload }) => {
      if (!payload) {
        state.alert = payload;
      } else if (payload.type) {
        state.alert = {
          type: payload.type,
          message: payload.message,
          title: payload.type === "warning" ? "Анхааруулга" : "Алдаа гарлаа",
        };
      } else if (payload.success) {
        state.alert = {
          type: "success",
          message: payload.message,
          title: i18n.t("Амжилттай"),
        };
      } else {
        state.alert = {
          type: "error",
          message: payload.message,
          title: i18n.t("Алдаа гарлаа"),
        };
      }
    },

    setHideNav: (state, { payload }) => {
      state.hideNav = payload;
    },
  },
});

export const { setLoading, setAlert, setNotify, setHideNav, setTitle } =
  slice.actions;

export const setAlertByResponse =
  ({ response, successMessage }) =>
  (dispatch) => {
    let alert = null;
    if (response.code === 500) {
      alert = { success: false, message: "Алдаа гарлаа" };
    } else if (response.status === "error") {
      alert = {
        success: false,
        message: response.message ? response.message : "Алдаа гарлаа",
      };
    } else {
      alert = { success: true, message: successMessage };
    }
    dispatch(setAlert(alert));
    return alert;
  };

export const handleResponseError = (responseData) => (dispatch) => {
  const success = responseData.success ?? responseData.Success;
  const message = responseData.message ?? responseData.Message;

  if (!success) {
    if (responseData["error-type"] === "validation") {
      const errorMessages = responseData.errors
        .forEach((error) => error.message)
        .join("\n");
      dispatch(setAlert({ success: false, message: errorMessages }));
    } else {
      if (message) {
        dispatch(setAlert({ success: false, message: message }));
      } else {
        dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
      }
    }
  }
  return true;
};

export default slice.reducer;
