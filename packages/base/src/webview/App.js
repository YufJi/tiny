import { INIT_DATA_READY } from 'shared/events/custom';
import { DOCUMENT_READY } from 'shared/events/native';
import { h, useState, useLayoutEffect } from './nerv';
import { FieldsContext, ConfigContext } from './context';
import { useCreation } from './common/hooks';
import Page from './Page';

function useInitPageConfig(bridge) {
  const [config, setConfig] = useState();

  useCreation(() => {
    bridge.subscribe(INIT_DATA_READY, (e) => {
      if (e.ext) {
        setConfig(e.ext);
      }
    });
  });

  return config;
}

export default function MicroApp(props) {
  const { fields } = props;
  const { bridge } = fields;

  const config = useInitPageConfig(bridge);

  useLayoutEffect(() => {
    bridge.invokeNative(DOCUMENT_READY);
  }, []);

  return (
    <FieldsContext.Provider value={fields}>
      <ConfigContext.Provider value={config}>
        <Page />
      </ConfigContext.Provider>
    </FieldsContext.Provider>
  );
}
