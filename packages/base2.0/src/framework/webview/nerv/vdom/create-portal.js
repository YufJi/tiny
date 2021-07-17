/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:36:44
 * @LastEditTime: 2021-07-13 11:38:17
 * @Description:
 * @FilePath: /yeact/src/vdom/create-portal.js
 */
import { VType } from '../shared';

export function createPortal(children, container) {
  return {
    type: container,
    vtype: VType.Portal,
    children,
    dom: null,
  };
}
