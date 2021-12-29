import { useState, useContext, useLayoutEffect, useEffect, Children } from 'react';
import { forOwn, hasIn, kebabCase, memoize, isEqual, camelCase, isPlainObject, isObject } from 'lodash';
import { CustomEvent, getType } from 'shared';

import { usePageFields, useCreation, useJSBridge, usePrevious } from '../common/hooks';
import { ComponentHubContext } from '../context';
import { mergeData } from '../util';

const { PageEvent, ComponentEvent, ComponentDataChange } = CustomEvent;

export function useComponentHubContext() {
  return useContext(ComponentHubContext);
}

export function useDataChange(nodeId, _data, _props) {
  const { emitter } = usePageFields();
  const { events } = useComponentHubContext();
  const [data, setData] = useState(() => {
    return JSON.parse(JSON.stringify(_data));
  });

  if (Object.keys(_props).length > 0) {
    setData((prevData) => {
      return mergeData(prevData, _props);
    });
  }

  const subscriber = useCreation(() => {
    return events.subscribe(ComponentDataChange, nodeId, (e) => {
      const { data } = e;
      setData((prevData) => {
        return mergeData(prevData, data);
      });
    });
  });

  useLayoutEffect(() => {
    emitter.emit('RE_RENDER', 'deprecated');
  }, [data]);

  useEffect(() => {
    return function () {
      return subscriber.remove();
    };
  }, [subscriber]);

  return data;
}

export function useLifeCycleHooks(nodeId, route) {
  const LIFE_CYCLE = ['created', 'attached', 'ready', 'detached'];
  const { publish } = useJSBridge();

  return useCreation(() => {
    return LIFE_CYCLE.map((eventName) => {
      return function () {
        publish(ComponentEvent, { route, nodeId, eventName });
      };
    });
  });
}

export function useRefinedDataset(props) {
  const _dataset = filterDataset(props);
  const prevDataset = usePrevious(_dataset);
  if (prevDataset === undefined) return [_dataset, true];

  const obj = {};
  forOwn(_dataset, (val, key) => {
    if (!isEqual(prevDataset[key], val)) {
      obj[key] = val;
    }
  });

  return [obj, false];
}

function filterDataset(props) {
  const o = {};

  for (let i = 0; i < Object.entries(props).length; i+=1) {
    const [key, value] = Object.entries(props)[i];
    const words = key.split('-');
    const prefix = words[0];
    const k = words.slice(1);

    if (prefix === 'data' && k.length > 0) {
      o[camelCase(k)] = value;
    }
  }

  return o;
}

export function useRefinedProps(props, properties) {
  const _props = normalizeProps(props, properties);
  const prevProps = usePrevious(_props);
  if (prevProps === undefined) return [_props, true];
  const obj = {};
  forOwn(_props, (val, key) => {
    if (!isEqual(prevProps[key], val)) {
      obj[key] = val;
    }
  });

  return [obj, false];
}

const blackPropList = [];
function normalizeProps(props, properties) {
  const obj = {};
  for (let i = 0; i < Object.entries(properties).length; i+=1) {
    const [key, value] = Object.entries(properties)[i];
    // eslint-disable-next-line no-continue
    if (blackPropList.indexOf(key) !== -1) continue;
    // eslint-disable-next-line no-loop-func
    [key, kebabCase(key)].forEach((k) => {
      if (hasIn(props, k)) {
        obj[key] = normalizeValue(value.type, props[k]);
      }
    });
  }

  return obj;
}

const ValidateStrategy = {
  string(o) {
    return isPlainObject(o) ? '[object Object]' : o ? String(o) : '';
  },
  number(o) {
    return isNaN(Number(o)) ? 0 : Number(o);
  },
  object(o) {
    return Array.isArray(o) ? o : isObject(o) ? {} : null;
  },
  boolean(o) {
    return !!o;
  },
  array(o) {
    return [];
  },
  null(o) {
    return o;
  },
};
function normalizeValue(type, value) {
  return getType(value) === type
    ? value
    : ValidateStrategy[type] && ValidateStrategy[type].call(ValidateStrategy, value) || null;
}

export function useSyncChangedDataset(dataset, nodeId, initial) {
  const { publish } = useJSBridge();
  useEffect(() => {
    if (!initial && Object.keys(dataset).length > 0) {
      publish(ComponentDataChange, {
        datatype: 'dataset',
        data: dataset,
        nodeId,
      });
    }
  }, [dataset]);
}

export function useSyncChangedProps(props, nodeId, initial) {
  const { publish } = useJSBridge();
  useEffect(() => {
    if (!initial && Object.keys(props).length > 0) {
      publish(ComponentDataChange, {
        datatype: 'properties',
        data: props,
        nodeId,
      });
    }
  }, [props]);
}

let seed = 1;
export function useNodeId() {
  return useCreation(() => {
    return seed += 1;
  });
}

export function useRenderContext(props, nodeId, is, config, resolveComponent) {
  const { publish } = useJSBridge();
  const fields = usePageFields();

  const eventBinder = useCreation(() => {
    return memoize((type) => {
      const handler = function (data) {
        return publish(PageEvent, { type, data, nodeId });
      };
      handler.displayName = type;
      return handler;
    });
  });

  return {
    $$class(t) {
      return `${String(t)}`;
    },
    $$slots: transformChildrenToSlots(props.children),
    $$eventBinder: eventBinder,
    $$resolveComponent: resolveComponent,
    __fields: fields,
    __dirname: is,
  };
}

function transformChildrenToSlots(children) {
  const slots = {};
  Children.forEach(children, (c) => {
    const slot = c && c.props && c.props.slot || '$default';
    const holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}
