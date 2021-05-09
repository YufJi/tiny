import Nerv, { useState } from '@/nerv';
import AppRegistry from '../AppRegistry';

export default function MicroApp(props) {
  const { pagePath, onRender, onFail } = props;

  const [config, setConfig] = useState();

  const PageComponent = AppRegistry.getComponent(pagePath);
  if (!PageComponent) {
    const error = new Error(`page '${pagePath}' not found!`);
    error.type = 'PAGE_NOT_FOUND';
    if (onFail) {
      onFail(error);
    }
  }

  console.log('framework: Render page', pagePath);
  if (onRender) {
    onRender(type);
  }
  const messageChannel = getMessageChannel(pageInfo, bridge);
  return config ? (
    <PageComponent
      pagePath={pagePath}
      container={container}
      messageChannel={messageChannel}
    />
  ) : null;
}

function useInitPageConfig(e) {
  const t = useState();
  const n = t[0];
  const r = t[1];

  useCreation(() => {
    JSBridge.subscribe('INIT_DATA_READY', (e) => {
      const t = e.config;
      t && r(t);
    });
  });

  return (
    n
  );
}
