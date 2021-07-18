/*
 * @Author: YufJ
 * @Date: 2021-07-07 11:53:06
 * @LastEditTime: 2021-07-18 21:51:19
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/context.js
 */
import EventEmitter from 'eventemitter3';
import { createContext } from './nerv';

import * as bridge from './bridge';

export const defaultFields = {
  root: document.body,
  bridge,
  status: {
    singleCamera: false,
    singleWebView: false,
  },
  emitter: new EventEmitter(),
};

export const FieldsContext = createContext(defaultFields);

export const ConfigContext = createContext();

export const ComponentHubContext = createContext({
  instances: {
    set: noop,
    remove: noop,
    get: noop,
  },
  events: {
    subscribe: noop,
    dispatch: noop,
  },
});
