import { CustomEvent, NativeEvent } from 'shared';
import { h, useState, useLayoutEffect } from './nerv';
import { FieldsContext, ConfigContext } from './context';
import { useCreation } from './common/hooks';
import Page from './Page';

const { INIT_DATA_READY } = CustomEvent;
const { DOCUMENT_READY } = NativeEvent;

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
