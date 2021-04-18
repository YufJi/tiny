
export const componentRegistry = {};
const ComponentRegistry = {
  registerComponent: function registerComponent(name, factory) {
    if (componentRegistry[name]) {
      return;
    }
    componentRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return componentRegistry[name] && componentRegistry[name]();
  },
};

export default ComponentRegistry;
