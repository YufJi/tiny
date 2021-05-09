import ComponentRegistry from './index';

function getComponentClass(is) {
  return ComponentRegistry.getComponent(is);
}

export default getComponentClass;
