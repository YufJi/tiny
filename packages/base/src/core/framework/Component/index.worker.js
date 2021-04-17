
import $global from '../common/global';
import CustomComponent from '../legacy/CustomComponent';

export default function WorkerComponent(setupConfig) {
  // $global.currentComponentConfig 会在转译后的代码里设置
  if (!$global.currentComponentConfig) {
    throw new Error('invalid Component usage!');
  }
  const { currentComponentConfig } = $global;
  $global.currentComponentConfig = null;
  return CustomComponent(setupConfig, currentComponentConfig);
}
