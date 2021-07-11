/*
 * @Author: YufJ
 * @Date: 2021-07-04 00:08:46
 * @LastEditTime: 2021-07-12 01:51:51
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/service/context/getAppInfo.js
 */
import { memoize } from 'lodash';

import { invokeNative } from '../bridge';

const getAppInfo = memoize(() => {
  return invokeNative('getAppInfoSync') || {};
}, (result) => {
  return Boolean(result.schema);
});

export default getAppInfo;
