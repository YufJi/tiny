/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:23:17
 * @LastEditTime: 2021-07-12 10:48:59
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/runtime-helpers/EmptyComponent.js
 */
import { h } from '../nerv';

export default function EmptyComponent(props) {
  const { children = null } = props || {};

  return children;
}
