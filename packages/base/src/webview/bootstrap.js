/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:29:06
 * @LastEditTime: 2021-08-13 16:12:04
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/bootstrap.js
 */
import EventEmitter from 'eventemitter3';
import { g } from 'shared';
import { h, hydrate as render } from './nerv';
import * as bridge from './bridge';
import MicroApp from './MicroApp';

export default function bootstrap() {
  const root = document.getElementById('__root__');
  const fields = {
    root,
    bridge,
    emitter: new EventEmitter(),
  };

  render(<MicroApp fields={fields} jsCore={g.JSCore} />, root);
}
