/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:34:44
 * @LastEditTime: 2021-07-17 03:08:53
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/MicroApp.js
 */
import { h, useLayoutEffect } from './nerv';
import { FieldsContext, ConfigContext } from './context';
import Page from './Page';
import { useInitPageConfig } from './hooks';

export default function MicroApp(props) {
  const { fields } = props;
  const { bridge } = fields;

  const config = useInitPageConfig(bridge);

  useLayoutEffect(() => {
    bridge.invokeNative('DocumentReady');
  }, []);

  return (
    <FieldsContext.Provider value={fields}>
      <ConfigContext.Provider value={config}>
        <Page />
      </ConfigContext.Provider>
    </FieldsContext.Provider>
  );
}
