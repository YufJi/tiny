export default {
  state: {
    status: 'idle',
    currentPage: '',
    pageStack: [],
    diagnostics: [],
    error: '',
  },
  reducers: {
    setRuntimeState(state, payload) {
      return {
        ...state,
        ...payload,
        pageStack: payload.pageStack ?? [],
        diagnostics: payload.diagnostics ?? [],
      };
    },
  },
};
