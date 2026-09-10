import i18n from "i18n";
import { createSlice } from "@reduxjs/toolkit";
import { setAlert } from "./index";
import Server, { call } from "config/Server";

export const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setData: (state, { payload: { user } }) => {
      state.user = user;
    },
  },
});

export const { setUser, setData, setLoading } = slice.actions;

export const login =
  ({ userName, password }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const responseData = await call({
        url: "auth/login",
        data: { userName, password },
      });
      dispatch(setLoading(false));

      if (!responseData.success) {
        dispatch(setAlert({ success: false, message: responseData.message }));
        return null;
      } else {
        return { token: responseData.data.token, user: responseData.data.user };
      }
    } catch (err) {
      console.log(err);
      dispatch(setLoading(false));
      dispatch(
        setAlert({ success: false, message: "Нэвтрэх явцад алдаа гарлаа" }),
      );
      return null;
    }
  };

export const loadData = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const responseData = await call({ url: "auth/get-user-data" });
    if (responseData.data && responseData.data.user) {
      dispatch(setData({ user: responseData.data.user }));
    } else {
      dispatch(setUser(null));
    }
    dispatch(setLoading(false));
  } catch (err) {
    console.log(err);
    dispatch(setLoading(false));
    dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
  }
};

export default slice.reducer;
