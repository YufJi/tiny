import React, { useLayoutEffect, useEffect, useRef } from 'react';
import { PolymerElement, html } from '@polymer/polymer';
import { memoize } from 'lodash';
import path from 'path';
import { CustomEvent, TemplateTag } from 'shared';

import { useJSBridge } from '../common/hooks';
import { getRealRoute } from '../util';
import { triggerRelationsEvent } from '../api';
import {
  useComponentHubContext,
  useDataChange,
  useLifeCycleHooks,
  useRefinedDataset,
  useRefinedProps,
  useSyncChangedDataset,
  useSyncChangedProps,
  useNodeId,
  useRenderContext,
} from './hooks';

const { ComponentDataChange, ComponentEvent } = CustomEvent;

export function registerCustomComponents(__allConfig__, customComponents) {
  console.log(__allConfig__, customComponents);
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

function defineCustomComponent(is, options, customComponentMap) {
  const { config, using } = options;
  const { properties, data } = config;

  // 自定义组件中resolve 自定义组件
  const resolveComponent = memoize((name) => {
    const path = using && using[name];
    if (!path) return null;

    const component = customComponentMap.get(getRealRoute(is, path)) || null;
    component.displayName = name;
    return component;
  });

  function Component(props) {
    const { render } = window.app[is];

    const { publish } = useJSBridge();
    const nodeId = useNodeId();
    // render context
    const ctx = useRenderContext(props, nodeId, is, config, resolveComponent);
    // 根据properties获得格式化后的props
    const [refinedProps, initialProps] = useRefinedProps(props, properties);
    // 获取dataset
    const [refinedDataset, initialDataset] = useRefinedDataset(props);
    // 监听dataChange事件，合并props和data为最终渲染data
    const changedData = useDataChange(nodeId, data, refinedProps);
    // publish消息而已
    const [created, attached, ready, detached] = useLifeCycleHooks(nodeId, is);

    useLayoutEffect(() => {
      created();
      // 同步组件信息
      syncInitialInfo(props, nodeId, publish);
      // 同步props
      syncInitialProps(refinedProps, nodeId, publish);
      // 同步dataset
      syncInitialDataset(refinedDataset, nodeId, publish);
      attached();
      ready();

      return () => {
        return detached();
      };
    }, []);

    // 当props变化后发送通知
    useSyncChangedProps(refinedProps, nodeId, initialProps);
    // 当dataset变化后发送通知
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
  }

  return Component;
}

function ShadowRoot(props) {
  const { $nodeId, $config, $name, attribute, children } = props;

  const { publish } = useJSBridge();
  const { instances } = useComponentHubContext();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;

    node._type_ = 'SHADOW_ROOT:custom-component';
    node._nodeId_ = $nodeId;
    node._config_ = $config;
    instances.set($nodeId, node);
    triggerRelationsEvent(node, true, publish);

    return () => {
      instances.remove($nodeId);
      triggerRelationsEvent(node, false, publish);
    };
  }, []);

  return React.createElement($name, {
    ref,
    ...attribute,
  }, children);
}

function syncInitialInfo(props, nodeId, publish) {
  const { id, className } = props;

  publish(ComponentDataChange, {
    datatype: 'instance',
    data: {
      id: id || '',
      className: className || '',
    },
    nodeId,
  });
}

function syncInitialProps(props, nodeId, publish) {
  publish(ComponentDataChange, {
    datatype: 'properties',
    data: props,
    nodeId,
  });
}

function syncInitialDataset(dataset, nodeId, publish) {
  publish(ComponentDataChange, {
    datatype: 'dataset',
    data: dataset,
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
