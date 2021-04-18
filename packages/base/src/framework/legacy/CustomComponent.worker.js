
import getComponentClass from '../ComponentRegistry/getComponentClass';
import mergeArray from '@/utils/mergeArray';
import setData, { spliceData, getOpStr } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
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
import getComponentProp from '../utils/getComponentProp';
import fireComponentLifecycle from '../utils/fireComponentLifecycle';

const eventReg = /^on[A-Z]/;

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
    });

    publicInstance.is = is;
    publicInstance.$id = id;
    publicInstance.$page = page.publicInstance;
    publicInstance.data = getProps('data', false);
    this.computedDeps = { ...ComponentClass.computedDeps };
    this.prevData = publicInstance.data;
    publicInstance.props = getProps('props');
    this.setComponentConfig(componentConfig, true);
  };

  ComponentClass.data = getProps('data');
  ComponentClass.props = getProps('props');

  ComponentClass.getAllComponents = function () {
    const allComponents = [is];

    objectKeys(usingComponents).forEach((c) => {
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

      const prevProps = publicInstance.props;
      if (diffProps) {
        const deleted = diffProps[DiffKeyDeleted];
        const updated = diffProps[DiffKeyUpdated];
        if (deleted && deleted.length || updated && objectKeys(updated).length) {
          publicInstance.props = { ...publicInstance.props };
        }
        if (deleted) {
          deleted.forEach((d) => {
            delete publicInstance.props[d];
          });
        }
        if (updated) {
          Object.assign(publicInstance.props, this.normalizeProps(updated));
        }
      }
      if (!init && (prevProps !== publicInstance.props || this.prevData !== publicInstance.data)) {
        this.update(prevProps, this.prevData);
        this.prevData = publicInstance.data;
      }
    },
    normalizeProps(oldProps) {
      const _this = this;

      const newProps = { ...oldProps };
      objectKeys(oldProps).forEach((p) => {
        if (p.match(eventReg)) {
          newProps[p] = _this.getTriggerEventHandler(p, oldProps[p]);
        }
      });
      return newProps;
    },
    getTriggerEventHandler(type, method) {
      const _this = this;

      if (!method) {
        return method;
      }
      const { triggerEventHandlers } = this;

      let handleFn = triggerEventHandlers[type];
      if (!handleFn) {
        handleFn = triggerEventHandlers[type] = function (...args) {
          return _this.triggerEvent.apply( _this, [handleFn.method].concat(args));
        };
      }
      // method may change for onXX type
      handleFn.method = method;
      return handleFn;
    },
    triggerEvent(method, ...args) {
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
