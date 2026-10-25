export default {
  state: {
    status: 'idle',
    currentPage: '',
    pageStack: [],
    pages: [],
    lifecycle: [],
    diagnostics: [],
    error: '',
  },
  reducers: {
    setRuntimeState(state, payload) {
      return {
        ...state,
        ...payload,
        pageStack: payload.pageStack ?? [],
        pages: payload.pages ?? [],
        lifecycle: payload.lifecycle ?? [],
        diagnostics: payload.diagnostics ?? [],
      };
    },
  },
};
