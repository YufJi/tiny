import { unset, get, set, isEqual, isString, isFunction, isPlainObject, cloneDeep } from 'lodash';
import { CustomEvent } from 'shared';
import { subscribe } from '../bridge';
import { componentModels, pageModels, componentBookmarks } from '../context';
import { onRouteEvent } from '../Route';
import { wrapUserFunction } from '../utils';
import { ComponentModel } from './model';
import { Component } from '../type';

const componentStatus = new WeakMap();

export default function loadComponent() {
  // 页面销毁时，所有已挂载的组件都卸载
  onRouteEvent('destroyPage', (page) => {
    const { webviewId } = page;
    const components: Component[] = componentModels[webviewId];

    if (!components) return;

    for (let i = 0; i < Object.values(components).length; i+=1) {
      const component = Object.values(components)[i];
      const status = componentStatus.get(component);

      if (status === 'attached') {
        component.lifetimes.detached.call(component);
      }
    }

    // 清除引用
    unset(componentModels, webviewId);
    unset(pageModels, webviewId);
  });

  /**
   * webview component 生命周期处理
   */
  subscribe(CustomEvent.ComponentEvent, (params, webviewId) => {
    const { nodeId, eventName, route } = params;

    if (!nodeId) return;
    let component;

    if (eventName === 'created') {
      component = new ComponentModel(route, webviewId, nodeId);
      componentStatus.set(component, 'created');
    } else {
      component = get(componentModels, [webviewId, nodeId]);
    }

    if (!component) {
      console.error(`[ComponentEvent] Component(${webviewId}.${nodeId}) not found`);
      return;
    }

    if (eventName === 'attached' || eventName === 'detached') {
      // switch detach attache
      componentStatus.set(component, eventName);
    }

    component.lifetimes[eventName].call(component, params.data);
  });

  /**
   * webview component data处理
   */
  subscribe(CustomEvent.ComponentDataChange, (params, webviewId) => {
    const { nodeId, datatype, data } = params;
    const componentModel = get(componentModels, [webviewId, nodeId]);

    if (!componentModel) {
      console.warn(`[ComponentDataChange] Component(${webviewId}.${nodeId}) not found`);
      return;
    }

    if (datatype === 'dataset') {
      Object.assign(componentModel.dataset, data);
      return;
    }

    if (datatype === 'instance') {
      // `instance` 事件应该只有一个 id 的设置
      if (isPlainObject(data)) {
        Object.assign(componentModel, data);
      }

      return;
    }

    if (datatype === 'properties') {
      const bookmark = componentBookmarks.get(componentModel.is);

      if (!bookmark) {
        console.warn(`[ComponentDataChange] bookmark(${componentModel.is}) not found in componentBookmarks`);
        return;
      }

      const { properties } = bookmark.init;

      for (let i = 0; i < Object.entries(data).length; i+=1) {
        const [key, newValue] = Object.entries(data)[i];
        const property = properties[key];
        const oldValue = cloneDeep(componentModel.data[key]);
        // 如果相等则不需要 trigger observer
        if (!isEqual(newValue, oldValue)) {
          set(componentModel.data, key, newValue);
          const observer = isString(property?.observer) ? componentModel[property?.observer] : property?.observer;

          if (isFunction(observer)) {
            wrapUserFunction(`at the observer of '${key}' in ${componentModel.is}`, observer).call(componentModel, newValue, oldValue);
          }
        }
      }
    }
  });
  /**
   * webview component relation 处理
   */
  subscribe('COMPONENT_RELATION_CHANGE', (params, webviewId) => {
    const { data } = params;
    if (!data) return;
    const components = componentModels[webviewId];
    if (!components) return;

    for (const event of data) {
      const { target, nodeId, type, originalKey } = event;
      const selfComponent = components[nodeId];
      const targetComponent = components[target];

      if (!targetComponent) {
        console.warn(`[COMPONENT_RELATION_CHANGE] targetComponent(${webviewId}.${target}) not found in componentModels`);
        return;
      }

      if (!selfComponent) {
        console.warn(`[COMPONENT_RELATION_CHANGE] selfComponent(${webviewId}.${nodeId}) not found in componentModels`);
        return;
      }

      const componentInit = componentBookmarks.get(selfComponent.is) && componentBookmarks.get(selfComponent.is).init;

      if (!componentInit) {
        console.warn(`[COMPONENT_RELATION_CHANGE] ${selfComponent.is} not found in componentBookmarks`);
        return;
      }

      const callback = get(componentInit.relations, [originalKey, type]);

      if (isFunction(callback)) {
        callback.call(selfComponent, targetComponent);
      }
    }
  });
}
