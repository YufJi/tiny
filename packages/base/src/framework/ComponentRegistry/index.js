export const componentRegistry = {};
const ComponentRegistry = {
  registerComponent(is, factory) {
    if (componentRegistry[is]) {
      return;
    }
    componentRegistry[is] = factory;
  },
  getComponent(is) {
    return componentRegistry[is] && componentRegistry[is]();
  },
};

export default ComponentRegistry;
