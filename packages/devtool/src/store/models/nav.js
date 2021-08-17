const global = {
  state: {
    navigationBarTitleText: '',
    // backgroundColor: '#ffffff',
  },
  reducers: {
    setTitle(state, payload) {
      return { ...state, title: payload };
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

export default global;
