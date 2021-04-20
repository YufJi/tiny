
import getComponentClass from '../ComponentRegistry/getComponentClass';
import mergeArray from '@/utils/mergeArray';
import setData, { spliceData, getOpStr } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
import mapValues from '@/utils/mapValues';
import invokeWithGuardAndReThrow from '@/utils/invokeWithGuardAndReThrow';
import {
  PendingKeyType,
  PendingKeyId,
  PendingKeyData,
  PendingKeyOp,
  PendingValueComponent,
  ComponentKeyDiffProps,
  ComponentKeyOwnerId,
  DiffKeyUpdated,
  DiffKeyDeleted,
} from '@/utils/consts';
import {
  eventReg
} from '@/utils/reg';

import getComponentProp from '../utils/getComponentProp';
import fireComponentLifecycle from '../utils/fireComponentLifecycle';

export default function Component(setupConfig, currentComponentConfig) {
  const { is, usingComponents } = currentComponentConfig;

  const propsCache = {};

  function getProps(prop, useCache = true) {
    return getComponentProp(setupConfig, prop, useCache ? propsCache : useCache);
  }

  function ComponentClass(page, id, componentConfig) {
    this.is = is;
    this.id = id;
    this.page = page;
    this.triggerEventHandlers = {};
    const self = this;
    const publicInstance = this.publicInstance = Object.create(getProps('methods'), {
      setData: {
        value: function value(a, b) {
          return self.setData(setData, a, b);
        },
      },
      $spliceData: {
        value: function value(a, b) {
          return self.setData(spliceData, a, b);
        },
      },
      triggerEvent: {
        value: function value(eventName, ...args) {
          if(typeof self.triggerEventHandlers[`on${eventName}`] === 'function') {
            return self.triggerEventHandlers[`on${eventName}`](...args);
          }
        },
      },
    });

    publicInstance.is = is;
    publicInstance.$id = id;
    publicInstance.$page = page.publicInstance;

    publicInstance.properties = mapValues(getProps('properties'), 'value');
    publicInstance.data = { ...getProps('data', false), ...mapValues(getProps('properties'), 'value') };

    this.computedDeps = { ...ComponentClass.computedDeps };
    this.prevData = publicInstance.data;

    this.setComponentConfig(componentConfig, true);
  };

  
  ComponentClass.data = { ...getProps('data', false), ...mapValues(getProps('properties'), 'value') };
  ComponentClass.properties = mapValues(getProps('properties'), 'value');

  ComponentClass.getAllComponents = function () {
    const allComponents = [is];

    objectKeys(usingComponents).forEach((c) => {
      /* 忽略当前自定义组件本身，防止死循环 */
      if (usingComponents[c] !== is) {
        const subUsingComponents = getComponentClass(usingComponents[c]).getAllComponents();
        mergeArray(allComponents, subUsingComponents);
      }
    });

    return allComponents;
  };

  ComponentClass.prototype = {
    setData(op, diffData, options_) {
      const { id, publicInstance } = this;

      if (this.unloaded) {
        console.log(`${'setData(...) can only update a mounted component. ' + 'This usually means you called setData() on a unmounted component. '}` + `Please check the code for the "${this.is}" component of "${this.page.getPagePath()}" page.`);
        return;
      }
      this.prevData = publicInstance.data;
      publicInstance.data = op(publicInstance.data, diffData);
      const data = {
        [PendingKeyType]: PendingValueComponent,
        [PendingKeyId]: id,
        [PendingKeyOp]: getOpStr(op),
        [PendingKeyData]: diffData,
      };
      let options = options_ || {};
      if (typeof options_ === 'function') {
        options = { complete: options_ };
      }
      this.page.setRemoteData(data, options);
    },
    setComponentConfig(c, init) {
      const ownerId = c[ComponentKeyOwnerId];
      const diffProps = c[ComponentKeyDiffProps];
      if (ownerId) {
        this.ownerId = ownerId;
      }
      const { publicInstance } = this;

      const prevProps = publicInstance.properties;
      if (diffProps) {
        const deleted = diffProps[DiffKeyDeleted];
        const updated = diffProps[DiffKeyUpdated];

        if (deleted && deleted.length || updated && objectKeys(updated).length) {
          publicInstance.properties = { ...publicInstance.properties };
        }
        if (deleted) {
          deleted.forEach((d) => {
            delete publicInstance.properties[d];
          });
        }
        if (updated) {
          Object.assign(publicInstance.properties, this.normalizeProps(updated));
        }
        Object.assign(publicInstance.data, publicInstance.properties);
      }
      if (!init && (prevProps !== publicInstance.properties || this.prevData !== publicInstance.data)) {
        this.update(prevProps, this.prevData);
        this.prevData = publicInstance.data;
      }
    },
    /* 注册event在props上 */
    normalizeProps(oldProps) {
      const newProps = { ...oldProps };
      objectKeys(oldProps).forEach((p) => {
        if (p.match(eventReg)) {
          newProps[p] = this.getTriggerEventHandler(p, oldProps[p]);
        }
      });
      return newProps;
    },
    /**
     * 
     * @param {*} type e.g. onclickme
     * @param {*} method  {n: "addTodo", o: 1}
     * @returns 
     */
    getTriggerEventHandler(type, method) {
      if (!method) {
        return method;
      }
      const { triggerEventHandlers } = this;

      let handleFn = triggerEventHandlers[type];
      if (!handleFn) {
        handleFn = triggerEventHandlers[type] = (...args) => {
          return this.$triggerEvent.apply(this, [handleFn.method].concat(args));
        };
      }
      // method may change for onXX type
      handleFn.method = method;
      return handleFn;
    },
    $triggerEvent(method, ...args) {
      /* todo 发送triggerComponentEvent type, detail, options */
      // tricky, page is also a component
      const ownerComponent = this.page.getComponentInstance(this.ownerId);
      if (ownerComponent) {
        const { publicInstance } = ownerComponent;

        if (!publicInstance[method]) {
          console.warn(`${ownerComponent.is}: can not find event handle method: ${method}`);
        }

        return invokeWithGuardAndReThrow(publicInstance[method], publicInstance, ...args);
      }
    },
    ready() {
      fireComponentLifecycle(setupConfig, this.publicInstance, 'didMount');
    },
    update(...args) {
      fireComponentLifecycle(setupConfig, this.publicInstance, 'didUpdate', args);
    },
    unload() {
      this.unloaded = true;
      fireComponentLifecycle(setupConfig, this.publicInstance, 'didUnmount');
    },
  };

  return ComponentClass;
}
