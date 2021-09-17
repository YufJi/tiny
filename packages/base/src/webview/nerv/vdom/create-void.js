/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:36:44
 * @LastEditTime: 2021-07-13 11:37:22
 * @Description:
 * @FilePath: /yeact/src/vdom/create-void.js
 */
import { VType } from '../shared';

export function createVoid() {
  return {
    dom: null,
    vtype: VType.Void,
  };
}
