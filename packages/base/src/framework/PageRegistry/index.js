// app注册page

const pageRegistry = {};

const PageRegistry = {
  registerComponent: function registerComponent(name, factory) {
    // name即pagePath
    // factory即() => RC
    pageRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return pageRegistry[name] && pageRegistry[name]();
  },
  getRunnable: function getRunnable(name) {
    return PageRegistry.getComponent(name);
  },
};

export default PageRegistry;
