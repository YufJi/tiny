import mergeArray from '@/utils/mergeArray';
import setData, { spliceData, getOpStr } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
import mapValues from 'lodash.mapvalues';
import defaultsDeep from 'lodash.defaultsdeep';
import {
  PendingKeyType,
  PendingKeyId,
  PendingKeyData,
  PendingKeyOp,
  PendingValueComponent,
  ComponentKeyDiffProps,
  DiffKeyUpdated,
  DiffKeyDeleted,
} from '@/utils/consts';

import getComponentClass from '../ComponentRegistry/getComponentClass';

import getComponentProp from '../utils/getComponentProp';
import fireComponentLifecycle from '../utils/fireComponentLifecycle';

export default function Component(config) {
  const { init, ancestors, is, usingComponents } = config;

  const propsCache = {};

  function getProps(prop, useCache = true) {
    return getComponentProp(init, prop, useCache ? propsCache : useCache);
  }

  function ComponentClass(page, id, componentConfig) {
    this.is = is;
    this.id = id;
    this.page = page;
    this.triggerEventHandlers = {};
    const self = this;

    this.publicInstance = Object.create({
      ...init,
      ...getProps('methods'),
    }, {
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
          self.page.callRemote.apply(self.page, ['self', 'triggerComponentCustomEvent', self.id, eventName].concat(args));
        },
      },
      getPageId: {
        value: function value() {
          return self.page.id;
        },
      },
    });

    const { publicInstance } = this;

    publicInstance.is = is;
    publicInstance.$id = id;
    publicInstance.$page = page.publicInstance;

    const initialData = defaultsDeep(mapValues(publicInstance.properties, 'value'), publicInstance.data);
    publicInstance.properties = initialData;
    publicInstance.data = initialData;

    this.prevData = publicInstance.data;

    this.setComponentConfig(componentConfig, true);
  }

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
      publicInstance.properties = publicInstance.data = op(publicInstance.data, diffData);
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
      const diffProps = c[ComponentKeyDiffProps];

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
          Object.assign(publicInstance.properties, updated);
        }
        Object.assign(publicInstance.data, publicInstance.properties);
      }

      if (!init && (prevProps !== publicInstance.properties || this.prevData !== publicInstance.data)) {
        this.prevData = publicInstance.data;
      }
    },
    // const COMPONENT_LIFETIMES = ['created', 'attached', 'ready', 'moved', 'detached', 'error'];
    created() {
      this.publicInstance.lifetimes.created.call(this.publicInstance);
    },
    attached(info) {
      this.setComponentConfig(info);
      this.publicInstance.lifetimes.attached.call(this.publicInstance);
    },
    ready(info) {
      info && this.setComponentConfig(info);
      this.publicInstance.lifetimes.ready.call(this.publicInstance);
    },
    unload() {
      this.unloaded = true;
      this.publicInstance.lifetimes.detached.call(this.publicInstance);
    },
  };

  return ComponentClass;
}
