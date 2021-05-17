import ComponentRegistry from '../ComponentRegistry';
import $global from '../common/global';
import CustomComponent from '../legacy/CustomComponent';
import { createBehavior } from '../Behavior';

let uid = 0;

export default function Component(setupConfig) {
  // $global.currentComponentConfig 会在转译后的代码里设置
  if (!$global.currentComponentConfig) {
    throw new Error('invalid Component usage!');
  }
  const { currentComponentConfig } = $global;
  $global.currentComponentConfig = null;

  const { is, usingComponents } = currentComponentConfig;

  if (ComponentRegistry.getComponent(is)) {
    throw new Error(`at ${is}, Component can only register once`);
  }

  const { init, ancestors } = createBehavior(`component-behavior-${uid++}`, setupConfig);

  $global.componentsConfig[is] = {
    publicInstance: init,
    usingComponents,
  };

  ComponentRegistry.registerComponent(is, () => {
    return CustomComponent({ init, ancestors, ...currentComponentConfig });
  });
}
