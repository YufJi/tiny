/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:29:06
 * @LastEditTime: 2021-07-18 21:48:59
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/bootstrap.js
 */
import EventEmitter from 'eventemitter3';
import { h, render } from './nerv';
import MicroApp from './MicroApp';

const globalJSCore = self.JSCore;

function createFields(root) {
  return {
    root,
    bridge,
    status: {
      singleCamera: false,
      singleWebView: false,
    },
    emitter: new EventEmitter(),
  };
}

export default function bootstrap() {
  const root = document.getElementById('root');
  const fields = createFields(root);

  render(<MicroApp fields={fields} jsCore={globalJSCore} />, root);
}
