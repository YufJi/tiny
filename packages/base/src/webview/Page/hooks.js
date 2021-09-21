import { isNil, memoize, isBoolean } from 'lodash';
import { Deferred, mergeData } from 'shared';
import { INIT_DATA_READY, APP_DATA_CHANGE, PAGE_EVENT, DOCUMENT_READY, DOCUMENT_SHOW } from 'shared/events/custom';
import { useState, useRef, useLayoutEffect, useEffect, useMemo, useReducer } from '../nerv';
import { useJSBridgeFn, useJSBridge, useConfigContext, usePageFields, useCreation } from '../common/hooks';
import {
  onComponentDataChange,
  onDisableScroll,
  onPageScrollTo,
  onRequestComponentObserver,
  onSelectComponent,
  onSelectComponentInPage,
  onTriggerComponentEvent,
  onAppLoadStatusChange,
  enableScroll,
} from '../api';
import { registerCustomComponents, createComponentResolve } from '../Component';

/* 获取generateFunc */
export function useCompileResult() {
  const [result, setResult] = useState({});

  useCreation(() => {
    document.addEventListener('generateFuncReady', (e) => {
      const { generateFunc, webviewId } = e.detail;
      setResult((prev) => (prev.render ? prev : generateFunc));
    });
  });

  return result;
}

/* 获取Page data */
export function usePageData(render) {
  const [data, setData] = useState({});
  const ref = useRef(new Deferred());
  useJSBridgeFn((bridge) => {
    const { subscribe, replyService } = bridge;

    subscribe(INIT_DATA_READY, (e) => {
      const { data } = e;

      setData(data);
    });

    replyService(APP_DATA_CHANGE)(async (params) => {
      const { data, options } = params;
      setData((prev) => mergeData(prev, data));
      return ref.current.promise;
    });
  });

  useLayoutEffect(() => {
    if (render) {
      ref.current.resolve();
      ref.current = new Deferred();
    }
  });

  return data;
}

/* _ctx */
export function useRenderContext() {
  const { publish } = useJSBridge();
  const config = useConfigContext();
  const fields = usePageFields();
  /* 先注册自定义组件 */
  const resolveComponent = useResolveComponent(config);
  const eventBinder = useCreation(() => {
    return memoize((type) => {
      const handler = function (data) {
        return publish(PAGE_EVENT, { type, data, nodeId: 0 });
      };
      handler.displayName = type;

      return handler;
    });
  });

  return {
    $$slots: {},
    $$eventBinder: eventBinder,
    $$resolveComponent: resolveComponent,
    __fields: fields,
    __dirname: (config && config.route) || '',
  };
}

/* 注册、查找自定义组件 */
export function useResolveComponent(config) {
  return useMemo(() => {
    if (!config) {
      return function () {
        return null;
      };
    }

    const { __allConfig__, customComponents, route } = config;

    /* 注册自定义组件 */
    const getCustomComponents = registerCustomComponents(__allConfig__, customComponents);
    const findHandler = function (is) {
      return !!__allConfig__[is];
    };

    return function (name) {
      const is = __allConfig__[route].usingComponents && __allConfig__[route].usingComponents[name];

      if (!is) return null;

      const cpath = createComponentResolve(route, findHandler)(is);
      const CC = getCustomComponents(cpath);
      CC.displayName = name;
      return CC;
    };
  }, [config]);
}

export function useComponentHub() {
  const instances = useInstanceHub();
  const events = useEventHub();

  return useCreation(() => {
    return {
      events,
      instances,
    };
  });
}

function useInstanceHub() {
  return useCreation(() => {
    const instanceMap = new Map();
    return {
      remove(is) {
        instanceMap.delete(is);
      },
      set(is, instance) {
        instanceMap.set(is, instance);
      },
      get(is) {
        return instanceMap.get(is) || null;
      },
    };
  });
}

function useEventHub() {
  const getDispatchKey = function (nodeId, t) {
    return `${t}:${nodeId}`;
  };

  return useCreation(() => {
    const eventMap = new Map();

    return {
      subscribe(t, n, callback) {
        const key = getDispatchKey(n, t);
        eventMap.set(key, callback);

        return {
          remove() {
            eventMap.delete(key);
          },
        };
      },
      dispatch(t, n) {
        const { nodeId } = n;
        const fn = eventMap.get(getDispatchKey(nodeId, t));
        return fn ? fn(n) : null;
      },
    };
  });
}

/* 展示模式 */
export function useRenderMode() {
  const [mode, setMode] = useState('Fallback');

  const normalState = useNormalState();
  const snapshotState = useSnapshotState();

  mode === 'Fallback'
    ? normalState
      ? setMode('Normal')
      : snapshotState && setMode('Snapshot')
    : mode === 'Snapshot' && normalState && !snapshotState && setMode('Normal');

  return mode;
}

function useNormalState() {
  const dataRef = useRef(false);
  const genRef = useRef(false);
  const [bool, setBool] = useState(false);

  useCreation(() => {
    document.addEventListener('generateFuncReady', () => {
      genRef.current = true;
      if (dataRef.current) {
        setBool(true);
      }
    });
  });

  useJSBridgeFn((bridge) => {
    bridge.subscribe(INIT_DATA_READY, () => {
      dataRef.current = true;
      if (genRef.current) {
        setBool(true);
      }
    });
  });

  return bool;
}

function useSnapshotState() {
  const ref = useRef(0);
  const [bool, dispatch] = useBoolean(false);

  useJSBridgeFn((bridge) => {
    const { onNative, subscribe } = bridge;

    onNative('onRenderSnapshot', (e) => {
      const { extra_data } = e;
      dispatch(true);
      ref.current = (extra_data && extra_data.snapshot_render_timeout) || 0;
    });

    subscribe('triggerSnapshotDiff', () => {
      setTimeout(() => {
        return dispatch(false);
      }, ref.current);
    });
  });

  return bool;
}

function useBoolean(initial) {
  return useReducer(toggleReducer, initial);
}

function toggleReducer(state, action) {
  return isBoolean(action) ? action : !state;
}

export function useInitAction() {
  const fields = usePageFields();
  const config = useConfigContext();

  useLayoutEffect(() => {
    initBodyScrollGetter();
  }, []);

  useEffect(() => {
    if (config) {
      enableScroll(config, fields);
    }
  }, [config, fields]);
}

function initBodyScrollGetter() {
  if (isNil(document.body.scrollTop)) {
    Object.defineProperty(document.body, 'scrollTop', {
      get() {
        return document.documentElement.scrollTop;
      },
      set(scrollTop) {
        document.documentElement.scrollTop = scrollTop;
      },
      configurable: true,
    });
  }
}

/* 监听jscore事件 */
export function useJSCoreEvent(componentHub) {
  const { bridge, emitter, root } = usePageFields();

  return useCreation(() => {
    onComponentDataChange(bridge, componentHub);
    onTriggerComponentEvent(bridge, componentHub);
    // onRequestComponentObserver(bridge, componentHub, emitter, root);
    onSelectComponentInPage(bridge, root);
    onSelectComponent(bridge, componentHub);
    // onRequestComponentInfo(bridge, componentHub, root);
    // onGetRelationNode(bridge, componentHub);
    // onAnimationStatusChange(emitter);
    onAppLoadStatusChange(bridge);
    onDisableScroll(bridge);
    onPageScrollTo(bridge);
  });
}

export function usePageLoad(render) {
  const { publish } = useJSBridge();
  const config = useConfigContext();

  // useLayoutEffect(() => {
  //   if (render && config && !config.isPageReload) {
  //     publish(DOCUMENT_SHOW, {});
  //   }
  // }, [config, publish, render]);

  useEffect(() => {
    if (render && config && !config.isPageReload) {
      publish(DOCUMENT_READY, {});
    }
  }, [config, publish, render]);
}
