/*
 * @Author: YufJ
 * @Date: 2021-07-12 11:24:38
 * @LastEditTime: 2021-07-12 11:25:32
 * @Description:
 * @FilePath: /yeact/src/options.js
 */
import { noop } from './utils';

const options = {
  afterMount: noop,
  afterUpdate: noop,
  beforeUpdate: noop,
  beforeUnmount: noop,
  beforeRender: noop,
  beforeMount: noop,
  afterCreate: noop,
  roots: [],
  debug: false,
};

export default options;
