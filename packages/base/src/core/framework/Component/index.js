import ComponentRegistry from '../ComponentRegistry';
import $global from '../common/global';
import CustomComponent from '../legacy/CustomComponent';

export default function WorkerComponent(setupConfig) {
  const { is } = setupConfig;

  $global.componentsConfig[is] = {
    system: setupConfig,
  };

  ComponentRegistry.registerComponent(is, () => {
    return CustomComponent(is);
  });
}
