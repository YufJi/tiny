/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:34:44
 * @LastEditTime: 2021-07-17 03:08:53
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/MicroApp.js
 */
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
