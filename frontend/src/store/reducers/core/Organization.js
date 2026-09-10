import i18n from "i18n";
import { createSlice } from "@reduxjs/toolkit";
import { setAlert, handleResponseError } from "store/reducers/system";
import { setSaveLoading } from "store/reducers/system/form";
import { list, lookup, one } from "utils/rest/dataSource";
import Server, { call } from "config/Server";
import defaultActions from "store/defaultActions";

export const slice = createSlice({
  name: "Organization",
  initialState: { loading: false },
  reducers: { ...defaultActions },
});

export const { setLoading, setDeleteLoading, setImportloading } = slice.actions;

export const validationRules = {
  Name: [{ type: "required", message: "Нэр оруулна уу" }],
  OrganizationTypeId: [{ type: "required", message: "Төрөл сонгоно уу" }],
  level: [{ type: "required", message: "Эрэмбэ сонгоно уу" }],
  addr_prov_city: [{ type: "required", message: "Аймаг/хот сонгоно уу" }],
  addr_soum_dist: [{ type: "required", message: "Сум/Дүүрэг сонгоно уу" }],
  branchId: [{ type: "required", message: "Салбар сонгоно уу" }],
};

export const getLookup = (options, select) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const responseData = await lookup({
      url: "/base/Organization/lookup",
      options,
      select,
    });

    dispatch(setLoading(false));
    if (responseData.data && responseData.success) {
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
    // Use custom endpoint that converts Logo blob to base64
    const responseData = await call({
      url: `/Organization/GetOne/${id}`,
      method: "GET",
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
      objectName: "Organization",
      select: [
        "*",
        { ParentOrganization: ["Id", "Name", "OrganizationTypeId"] },
        { vwOrganizationType: ["value", "label"] },
        { vwOrganizationLevel: ["value", "label"] },
        { vwOrganizationHospitalType: ["value", "label"] },
        { DictProvinceCity: ["id_data", "name"] },
        { DictSoumDistrict: ["id_data", "name"] },
        { DictBagKhoroo: ["id_data", "name"] },
        { CreateUser: ["Id", "UserName"] },
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
      // Use CustomSave endpoint which handles Logo base64 conversion
      const payload = { ...data, Id: id };
      const responseData = await call({
        url: "/Organization/CustomSave",
        method: "POST",
        data: { Data: JSON.stringify(payload) },
      });
      dispatch(setSaveLoading({ formName, loading: false }));
      const success = responseData.success ?? responseData.Success;
      if (success) {
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
      // Use CustomSave endpoint which handles Logo base64 conversion
      const responseData = await call({
        url: "/Organization/CustomSave",
        method: "POST",
        data: { Data: JSON.stringify(data) },
      });
      dispatch(setSaveLoading({ formName, loading: false }));
      const success = responseData.success ?? responseData.Success;
      if (success) {
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
      url: "/base/Organization/" + id,
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

// Row counts that a merge would move, per table. Read-only - nothing is
// written until mergeOrganizations is called.
export const mergePreview =
  ({ SourceId, TargetId }) =>
  async (dispatch) => {
    try {
      const responseData = await call({
        url: "/Organization/MergePreview",
        method: "POST",
        data: { SourceId, TargetId },
      });
      const success = responseData.success ?? responseData.Success;
      if (success) return responseData.data ?? responseData.Data;

      dispatch(handleResponseError(responseData));
      return null;
    } catch (err) {
      console.error({ err });
      dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
      return null;
    }
  };

export const mergeOrganizations =
  ({ SourceId, TargetId }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const responseData = await call({
        url: "/Organization/Merge",
        method: "POST",
        data: { SourceId, TargetId },
      });
      dispatch(setLoading(false));
      const success = responseData.success ?? responseData.Success;
      if (success) {
        dispatch(
          setAlert({
            success: true,
            message:
              responseData.message ??
              responseData.Message ??
              "Амжилттай нэгтгэлээ",
          }),
        );
        return true;
      }
      dispatch(handleResponseError(responseData));
      return false;
    } catch (err) {
      console.error({ err });
      dispatch(setLoading(false));
      dispatch(setAlert({ success: false, message: "Алдаа гарлаа" }));
      return false;
    }
  };

export default slice.reducer;
