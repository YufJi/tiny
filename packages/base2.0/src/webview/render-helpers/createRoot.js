/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:23:17
 * @LastEditTime: 2021-07-12 10:40:33
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/runtime-helpers/createRoot.js
 */
import { h, Fragment } from '../nerv';

export default function createRoot(element) {
  if (Array.isArray(element)) {
    return <Fragment>{element}</Fragment>;
  }

  return element;
}
