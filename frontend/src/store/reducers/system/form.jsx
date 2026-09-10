import i18n from "i18n";
import { createSlice } from "@reduxjs/toolkit";

// Helper function to create timestamp-like value similar to moment().format("HH:mm:ss:ii")
const getTimestamp = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
};

export const slice = createSlice({
  name: "form",
  initialState: {},
  reducers: {
    disposeForm: (state, { payload }) => {
      state[payload] = undefined;
    },
    setVisible: (state, { payload: { formName, visible } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].visible = visible;
    },
    setModifyData: (state, { payload: { formName, data } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].modifyData = data;
    },
    setEditData: (state, { payload: { formName, data } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].editData = data;
      state[formName].modifyData = {};
    },
    setFieldValue: (state, { payload: { formName, fieldName, value } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].editData[fieldName] = value;
      state[formName].modifyData[fieldName] = value;
    },
    setFieldsValue: (state, { payload: { formName, values } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      for (let i = 0; i < Object.keys(values).length; i++) {
        const fieldName = Object.keys(values)[i];
        const value = values[fieldName];
        state[formName].editData[fieldName] = value;
        state[formName].modifyData[fieldName] = value;
      }
    },

    setFieldValueAndRefresh: (
      state,
      { payload: { formName, fieldName, value } },
    ) => {
      const date = getTimestamp();
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].editData[fieldName] = value;
      state[formName].modifyData[fieldName] = value;

      if (state[formName].fields[fieldName] === undefined) {
        state[formName].fields[fieldName] = {};
      }
      state[formName].fields[fieldName] = {
        ...state[formName].fields[fieldName],
        refresh: date,
      };
    },

    setFieldsValueAndRefresh: (state, { payload: { formName, values } }) => {
      const date = getTimestamp();
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      for (let i = 0; i < Object.keys(values).length; i++) {
        const fieldName = Object.keys(values)[i];
        const value = values[fieldName];
        state[formName].editData[fieldName] = value;
        state[formName].modifyData[fieldName] = value;

        if (state[formName].fields[fieldName] === undefined) {
          state[formName].fields[fieldName] = {};
        }
        state[formName].fields[fieldName] = {
          ...state[formName].fields[fieldName],
          refresh: date,
        };
      }
    },
    setLoading: (state, { payload: { formName, loading } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].loading = loading;
    },

    setSaveLoading: (state, { payload: { formName, loading } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].saveLoading = loading;
    },
    setValidate: (state, { payload: { formName, fieldName, validate } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      if (
        state[formName].fields[fieldName] &&
        state[formName].fields[fieldName]
      ) {
        // intentionally empty
      } else {
        state[formName].fields[fieldName] = {};
      }
      state[formName].fields[fieldName].validate = validate;
    },
    setEditDataAndModify: (state, { payload: { formName, data } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      state[formName].editData = data;
      state[formName].modifyData = data;
    },
    setFieldState: (state, { payload: { formName, fieldName, values } }) => {
      if (!state[formName]) {
        state[formName] = { editData: {}, modifyData: {}, fields: {} };
      }
      if (state[formName].fields[fieldName] === undefined) {
        state[formName].fields[fieldName] = {};
      }
      state[formName].fields[fieldName] = {
        ...state[formName].fields[fieldName],
        ...values,
      };
    },
  },
});

export const {
  disposeForm,
  setFieldValue,
  setLoading,
  setEditData,
  setModifyData,
  setSaveLoading,
  setValidate,
  setEditDataAndModify,
  setVisible,
  setFieldState,
  setFieldValueAndRefresh,
  setFieldsValueAndRefresh,
  setFieldsValue,
} = slice.actions;

export const validationRules = {
  name1: [{ type: "required", message: "нэр оруулна уу " }],
};

export default slice.reducer;
