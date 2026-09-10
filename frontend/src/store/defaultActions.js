export default {
  setDeleteLoading: (state, { payload }) => {
    state.deleteLoading = payload;
  },
  setLoading: (state, { payload }) => {
    state.loading = payload;
  },
  setPrinting: (state, { payload }) => {
    state.printing = payload;
  },
  setImportloading: (state, { payload }) => {
    state.importloading = payload;
  },
};
