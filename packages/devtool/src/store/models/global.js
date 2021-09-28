export default {
  state: {
    // ['render-1', 'render-2']
    pageStack: [],
    appConfig: {},
    tabBarConfig: null,
  },
  reducers: {
    setAppConfig(state, payload) {
      return { ...state, appConfig: payload };
    },
    setTabBarConfig(state, payload) {
      return { ...state, tabBarConfig: payload };
    },
    setPageStack(state, payload) {
      return { ...state, pageStack: payload };
    },
  },
  effects: () => ({

  }),
};
