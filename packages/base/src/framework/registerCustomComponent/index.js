import PolyfillMap from '@/utils/Map';
import objectKeys from '@/utils/objectKeys';
import $global from '../common/global';

const CustomComponentMap = new PolyfillMap();

function defineCustomComponent(name, componentPath) {
  if (CustomComponentMap.get(name)) {
    return;
  }

  class CustomComponent extends HTMLElement {
    constructor() {
      super();
    }
  }

  window.customElements.define(name, CustomComponent);
}

export default function registerCustomComponents(pagePath) {
  const pageConfig = $global.pagesConfig[pagePath].system;

  function resolveComponent(usingComponents) {
    objectKeys(usingComponents).forEach((name) => {
      const componentPath = usingComponents[name];
      const componentConfig = $global.componentsConfig[componentPath].system;
      defineCustomComponent(name, componentPath);
      resolveComponent(componentConfig.usingComponents || {});
    });
  }

  resolveComponent(pageConfig.usingComponents || {});
}
