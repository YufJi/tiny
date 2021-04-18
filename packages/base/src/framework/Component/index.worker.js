import ComponentRegistry from '../ComponentRegistry';
import $global from '../common/global';
import CustomComponent from '../legacy/CustomComponent';

export default function Component(setupConfig) {
  // $global.currentComponentConfig 会在转译后的代码里设置
  if (!$global.currentComponentConfig) {
    throw new Error('invalid Component usage!');
  }
  const { currentComponentConfig } = $global;
  $global.currentComponentConfig = null;

  const { is } = currentComponentConfig;

  ComponentRegistry.registerComponent(is, () => {
    return CustomComponent(setupConfig, currentComponentConfig);
  });
}
