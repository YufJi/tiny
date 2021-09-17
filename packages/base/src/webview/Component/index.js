/* eslint-disable import/no-cycle */
/*
 * @Author: YufJ
 * @Date: 2021-07-09 17:30:43
 * @LastEditTime: 2021-08-13 11:03:13
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/Component.js
 */
import { memoize } from 'lodash';
import path from 'path';

import { h, useDangerousReverseLayoutEffect, useLayoutEffect, useRef } from '../nerv';
import { useJSBridge } from '../common/hooks';
import { getRealRoute } from '../util';
import {
  useComponentHubContext,
  useDataChange,
  useLifeCycleHooks,
  useRefinedDataset,
  useRefinedProps,
  useSyncChangedDataset,
  useSyncChangedProps,
  useNodeId,
  useComponentRenderContext,
} from './hooks';

export function registerCustomComponents(__allConfig__, customComponents) {
  const customComponentMap = new Map();

  Object.keys(customComponents).forEach((is) => {
    /* 自定义组件初始config */
    const config = customComponents[is];
    /* 自定义组件下的组件引用 */
    const using = __allConfig__[is].usingComponents;

    customComponentMap.set(is, defineCustomComponent(is, { config, using }, customComponentMap));
  });

  return function (is) {
    return customComponentMap.get(is) || null;
  };
}

export function defineCustomComponent(is, options, customComponentMap) {
  const { config, using } = options;
  const { properties, data } = config;

  const resolveComponent = memoize((name) => {
    const path = using && using[name];
    if (!path) return null;

    const component = customComponentMap.get(getRealRoute(is, path)) || null;
    component.displayName = name;
    return component;
  });

  return function Component(props) {
    const { render } = window.app[is];

    const { publish } = useJSBridge();
    const nodeId = useNodeId();
    const ctx = useComponentRenderContext(props, nodeId, is, config, resolveComponent);
    const [refinedProps, initialProps] = useRefinedProps(props, properties);
    const [refinedDataset, initialDataset] = useRefinedDataset(props);
    const changedData = useDataChange(nodeId, data, refinedProps);
    const [created, attached, ready, detached] = useLifeCycleHooks(nodeId, is);

    useDangerousReverseLayoutEffect(() => {
      created();
      syncInitialInfo(props, nodeId, publish);
      syncInitialProps(refinedProps, nodeId, publish);
      syncInitialDataset(refinedDataset, nodeId, publish);
      attached();
      ready();

      return () => {
        return detached();
      };
    }, []);

    useSyncChangedProps(refinedProps, nodeId, initialProps);
    useSyncChangedDataset(refinedDataset, nodeId, initialDataset);

    return (
      <ShadowRoot
        $nodeId={nodeId}
        $config={config}
        $name={Component.displayName || 'custom-component'}
        attribute={props}
      >
        {render(changedData, ctx)}
      </ShadowRoot>
    );
  };
}

function ShadowRoot(props) {
  const { $nodeId, $config, $name, attribute, children } = props;

  const { publish } = useJSBridge();
  const { instances } = useComponentHubContext();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;

    node._type_ = 'SHADOW_ROOT:custom-comp';
    node._nodeId_ = $nodeId;
    node._config_ = $config;
    node.setAttribute('__cc-name__', $name);
    instances.set($nodeId, node);

    return () => {
      instances.remove($nodeId);
    };
  }, []);

  return h($name, {
    ref,
    ...attribute,
  }, children);
}

function syncInitialInfo(props, nodeId, publish) {
  const { id, className } = props;

  publish('COMPONENT_DATA_CHANGE', {
    data: {
      id: id || '',
      className: className || '',
    },
    datatype: 'instance',
    nodeId,
  });
}

function syncInitialProps(data, nodeId, publish) {
  publish('COMPONENT_DATA_CHANGE', {
    datatype: 'properties',
    data,
    nodeId,
  });
}

function syncInitialDataset(data, nodeId, publish) {
  publish('COMPONENT_DATA_CHANGE', {
    datatype: 'dataset',
    data,
    nodeId,
  });
}

export function createComponentResolve(route, findHandler) {
  return function (is) {
    if (is.startsWith('/')) {
      const p = is.slice(1);

      return [p, `${p}/index`].find(findHandler) || is;
    }

    const p = path.join(path.dirname(route), is);
    const pp = [p, `${p}/index`];

    if (!is.startsWith('./')) {
      const list = [path.join('miniprogram_npm/', is), `${path.join('miniprogram_npm/', is)}/index`];
      pp.push(list);
    }

    return pp.find(findHandler) || pp[0];
  };
}
