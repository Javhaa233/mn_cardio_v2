import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "dataGrid",
  initialState: {},
  reducers: {
    disposeGrid: (state, { payload }) => {
      state[payload] = undefined;
    },
    setCurrent: (state, { payload: { gridName, data } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName].current = data;
    },
    setSelectedRows: (state, { payload: { gridName, data } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName].selectedRows = data;
    },
    setRootFilter: (state, { payload: { gridName, arrayFilter } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName].rootFilter = arrayFilter;
    },
    setFilter: (state, { payload: { gridName, arrayFilter } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName].filter = arrayFilter;
    },
    setLoading: (state, { payload: { gridName, loading } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName].loading = loading;
    },
    setState: (state, { payload: { gridName, values } }) => {
      if (state[gridName] === undefined) {
        state[gridName] = {};
      }
      state[gridName] = {
        ...state[gridName],
        ...values,
      };
    },
  },
});

export const {
  disposeGrid,
  setCurrent,
  setFilter,
  setLoading,
  setRootFilter,
  setSelectedRows,
  setState,
} = slice.actions;

export default slice.reducer;
