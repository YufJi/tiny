/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:23:17
 * @LastEditTime: 2021-07-12 10:40:49
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/runtime-helpers/createBlock.js
 */
import { h, Fragment } from '../nerv';

export default function createBlock(element, props) {
  let arrayElements = element;
  if (!Array.isArray(arrayElements)) {
    arrayElements = [arrayElements];
  }
  if (Fragment) {
    return <Fragment {...props}>{arrayElements}</Fragment>;
  } else {
    return arrayElements;
  }
}
