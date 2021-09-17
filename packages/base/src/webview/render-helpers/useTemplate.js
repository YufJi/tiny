/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:23:17
 * @LastEditTime: 2021-07-12 10:49:09
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/runtime-helpers/useTemplate.js
 */
import { h, Fragment } from '../nerv';

export default function useTemplate(template, data, key, context) {
  return (
    <Fragment key={key}>
      {template ? template(data, context) : null}
    </Fragment>
  );
}
