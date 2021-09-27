import { noop } from 'lodash';
import { createContext } from './nerv';

export const FieldsContext = createContext();

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
