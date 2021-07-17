/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:36:44
 * @LastEditTime: 2021-07-13 11:37:12
 * @Description:
 * @FilePath: /yeact/src/vdom/create-vtext.js
 */
import { VType } from '../shared';

export default function createVText(text) {
  return {
    text,
    vtype: VType.Text,
    dom: null,
  };
}
