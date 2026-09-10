import i18n from "i18n";
import { createSlice } from "@reduxjs/toolkit";

import { setAlert, handleResponseError } from "store/reducers/system";
import { setSaveLoading } from "store/reducers/system/form";
import { list, lookup, one } from "utils/rest/dataSource";
import Server, { call } from "config/Server";
import defaultActions from "store/defaultActions";

export const slice = createSlice({
  name: "TurulhiinGajig",
  initialState: { loading: false },
  reducers: { ...defaultActions },
});

export const { setLoading, setDeleteLoading, setImportloading } = slice.actions;

export const validationRules = {};

export const getLookup = (options) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const responseData = await lookup({
      url: "/base/TurulhiinGajig/lookup",
      options,
    });

    dispatch(setLoading(false));
    if (responseData.success) {
      return {
        data: responseData.data.rows,
        totalCount: responseData.data.count,
      };
    } else {
      dispatch(handleResponseError(responseData));
      return { data: [], totalCount: 0 };
    }
  } catch (err) {
    console.log({ err });
    dispatch(setLoading(false));
    dispatch(
      setAlert({ success: false, message: "Мэдээ татахад алдаа гарлаа" }),
    );
    return { data: [], totalCount: 0 };
  }
};

export const getOne = (id, select) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const responseData = await one({
      objectName: "TurulhiinGajig",
      id,
      select,
    });
    dispatch(setLoading(false));
    if (responseData.success) {
      return responseData.data;
    } else {
      dispatch(handleResponseError(responseData));
      return null;
    }
  } catch (err) {
    console.log({ err });
    dispatch(setLoading(false));
    dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
    return false;
  }
};

export const getList = (options) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const responseData = await list({
      objectName: "TurulhiinGajig",
      select: [
        "*",
        {
          DoctorsProfile: [
            "lastname",
            "firstname",
            "FullName",
            "organisation",
            { DictProvinceCity: ["name"] },
            { DictSoumDistrict: ["name"] },
            { DictBagKhoroo: ["name"] },
            { Organization: ["name"] },
          ],
        },
      ],
      options,
    });

    dispatch(setLoading(false));
    if (responseData.success) {
      return {
        data: responseData.data.rows,
        totalCount: responseData.data.count,
      };
    } else {
      dispatch(handleResponseError(responseData));
      return { data: [], totalCount: 0 };
    }
  } catch (err) {
    console.log({ err });
    dispatch(setLoading(false));
    dispatch(
      setAlert({ success: false, message: "Мэдээ татахад алдаа гарлаа" }),
    );
    return { data: [], totalCount: 0 };
  }
};

export const update =
  ({ id, data, formName }) =>
  async (dispatch) => {
    dispatch(setSaveLoading({ formName, loading: true }));
    try {
      const responseData = await call({
        url: "/base/TurulhiinGajig/" + id,
        method: "PUT",
        data,
      });
      dispatch(setSaveLoading({ formName, loading: false }));
      if (responseData.success) {
        dispatch(setAlert({ success: true, message: "Амжилттай хадгаллаа" }));
        return true;
      } else {
        dispatch(handleResponseError(responseData));
        return false;
      }
    } catch (err) {
      console.log({ err });
      dispatch(setSaveLoading({ formName, loading: false }));
      dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
      return false;
    }
  };

export const create =
  ({ data, formName }) =>
  async (dispatch) => {
    dispatch(setSaveLoading({ formName, loading: true }));
    try {
      const responseData = await call({
        url: "/base/TurulhiinGajig",
        method: "POST",
        data,
      });
      dispatch(setSaveLoading({ formName, loading: false }));
      if (responseData.success) {
        dispatch(setAlert({ success: true, message: "Амжилттай хадгаллаа" }));
        return true;
      } else {
        dispatch(handleResponseError(responseData));
        return false;
      }
    } catch (err) {
      console.error({ err });
      dispatch(setSaveLoading({ formName, loading: false }));
      dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
      return false;
    }
  };

export const destroy = (id) => async (dispatch) => {
  dispatch(setDeleteLoading(true));
  try {
    const responseData = await call({
      url: "/base/TurulhiinGajig/" + id,
      method: "DELETE",
    });
    dispatch(setDeleteLoading(false));
    if (responseData.success) {
      dispatch(setAlert({ success: true, message: "Амжилттай устгалаа" }));
      return true;
    } else {
      dispatch(handleResponseError(responseData));
      return false;
    }
  } catch (err) {
    console.error({ err });
    dispatch(setDeleteLoading(false));
    dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
    return false;
  }
};

export default slice.reducer;
