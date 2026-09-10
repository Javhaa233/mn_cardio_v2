import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "component",
  initialState: {},
  reducers: {
    disposeComponent: (state, { payload }) => {
      state[payload] = undefined;
    },
    setState: (state, { payload: { componentName, values } }) => {
      if (state[componentName] === undefined) {
        state[componentName] = {};
      }
      state[componentName] = {
        ...state[componentName],
        ...values,
      };
    },
  },
});

export const { disposeComponent, setState } = slice.actions;

export default slice.reducer;
