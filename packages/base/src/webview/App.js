import React, { useState, useLayoutEffect } from 'react';
import { CustomEvent, NativeEvent } from 'shared';

import { FieldsContext, ConfigContext } from './context';
import { useCreation } from './common/hooks';
import Page from './Page';

const { InitDataReady } = CustomEvent;
const { DocumentReady } = NativeEvent;

function useInitPageConfig(bridge) {
  const [config, setConfig] = useState();

  useCreation(() => {
    bridge.subscribe(InitDataReady, (e) => {
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
    bridge.invokeNative(DocumentReady);
  }, []);

  return (
    <FieldsContext.Provider value={fields}>
      <ConfigContext.Provider value={config}>
        <Page />
      </ConfigContext.Provider>
    </FieldsContext.Provider>
  );
}
