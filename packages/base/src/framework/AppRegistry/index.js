// app注册page

const appRegistry = {};

const AppRegistry = {
  registerComponent: function registerComponent(name, factory) {
    // name即pagePath
    // factory即() => RC
    appRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return appRegistry[name] && appRegistry[name]();
  },
  getRunnable: function getRunnable(name) {
    return AppRegistry.getComponent(name);
  },
};

export default AppRegistry;
