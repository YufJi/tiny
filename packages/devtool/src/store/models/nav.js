export default {
  state: {
    navigationBarTitleText: '',
    // backgroundColor: '#ffffff',
  },
  reducers: {
    setTitle(state, payload) {
      return { ...state, navigationBarTitleText: payload };
    },
    setBackgroundColor(state, payload) {
      return { ...state, backgroundColor: payload };
    },
    setNavConfig(state, payload) {
      return { ...state, ...payload };
    },
  },
  effects: () => ({

  }),
};
