import {
  isFunction,
} from '@/nerv/utils';
import { noop } from '@/nerv/shared';
import addListenerToElement, { removeListenerToElement } from '@/utils/addListenerToElement';

const ONINPUT = 'oninput';
const ONPROPERTYCHANGE = 'onpropertychange';

const bindFocus = false;
declare global {
  interface Event {
    persist: Function;
  }
}

if (typeof Event !== 'undefined' && !Event.prototype.persist) {
  // tslint:disable-next-line:no-empty
  Event.prototype.persist = noop;
}

export function attachEvent(
  domNode: Element,
  eventName: string,
  handler: any,
) {
  eventName = fixEvent(domNode, eventName);
  /* istanbul ignore next */
  if (eventName === ONPROPERTYCHANGE) {
    processOnPropertyChangeEvent(domNode, handler);
    return;
  }

  addListenerToElement(domNode, eventName, handler);
}

export function detachEvent(
  domNode: Element,
  eventName: string,
  handler: Function,
) {
  eventName = fixEvent(domNode, eventName);
  if (eventName === ONPROPERTYCHANGE) {
    return;
  }

  removeListenerToElement(domNode, eventName, handler);
}

let propertyChangeActiveElement;
let propertyChangeActiveElementValue;
let propertyChangeActiveElementValueProp;
const propertyChangeActiveHandlers = {};

/* istanbul ignore next */
function propertyChangeHandler(event) {
  if (event.propertyName !== 'value') {
    return;
  }
  const target = event.target || event.srcElement;
  const val = target.value;
  if (val === propertyChangeActiveElementValue) {
    return;
  }
  propertyChangeActiveElementValue = val;
  const handler = propertyChangeActiveHandlers[target.name];
  if (isFunction(handler)) {
    handler.call(target, event);
  }
}

/* istanbul ignore next */
function processOnPropertyChangeEvent(node, handler) {
  propertyChangeActiveHandlers[node.name] = handler;
  if (!bindFocus) {
    // bindFocus = true
    node.addEventListener(
      'focusin',
      () => {
        unbindOnPropertyChange();
        bindOnPropertyChange(node);
      },
      false,
    );
    node.addEventListener('focusout', unbindOnPropertyChange, false);
  }
}

/* istanbul ignore next */
function bindOnPropertyChange(node) {
  propertyChangeActiveElement = node;
  propertyChangeActiveElementValue = node.value;
  propertyChangeActiveElementValueProp = Object.getOwnPropertyDescriptor(
    node.constructor.prototype,
    'value',
  );
  Object.defineProperty(propertyChangeActiveElement, 'value', {
    get() {
      return propertyChangeActiveElementValueProp.get.call(this);
    },
    set(val) {
      propertyChangeActiveElementValue = val;
      propertyChangeActiveElementValueProp.set.call(this, val);
    },
  });
  propertyChangeActiveElement.addEventListener(
    'propertychange',
    propertyChangeHandler,
    false,
  );
}

/* istanbul ignore next */
function unbindOnPropertyChange() {
  if (!propertyChangeActiveElement) {
    return;
  }
  delete propertyChangeActiveElement.value;
  propertyChangeActiveElement.removeEventListener(
    'propertychange',
    propertyChangeHandler,
    false,
  );

  propertyChangeActiveElement = null;
  propertyChangeActiveElementValue = null;
  propertyChangeActiveElementValueProp = null;
}

function detectCanUseOnInputNode(node) {
  const nodeName = node.nodeName && node.nodeName.toLowerCase();
  const { type } = node;
  return (
    (nodeName === 'input' && /text|password/.test(type))
    || nodeName === 'textarea'
  );
}

function fixEvent(node: Element, eventName: string) {
  if (eventName === 'onDoubleClick') {
    eventName = 'ondblclick';
  } else if (eventName === 'onTouchTap') {
    eventName = 'onclick';
    // tslint:disable-next-line:prefer-conditional-expression
  } else if (eventName === 'onChange' && detectCanUseOnInputNode(node)) {
    eventName = ONINPUT in window ? ONINPUT : ONPROPERTYCHANGE;
  } else {
    eventName = eventName.toLowerCase();
  }
  return eventName;
}
