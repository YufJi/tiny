import { isFunction, MapClass } from '@/nerv/utils';
import { noop } from '@/nerv/shared';
import { supportedPassiveEventMap } from './passive-event';

const ONINPUT = 'oninput';
const ONPROPERTYCHANGE = 'onpropertychange';

const delegatedEvents = new MapClass();

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
  handler: Function,
) {
  eventName = fixEvent(domNode, eventName);
  /* istanbul ignore next */
  if (eventName === ONPROPERTYCHANGE) {
    processOnPropertyChangeEvent(domNode, handler);
    return;
  }
  const parsedEvent = parseEventName(eventName);
  let delegatedRoots = delegatedEvents.get(normalizeEventName(eventName));
  if (!delegatedRoots) {
    delegatedRoots = new MapClass();
  }
  const event = attachEventToNode(domNode, parsedEvent, delegatedRoots);
  delegatedEvents.set(normalizeEventName(eventName), delegatedRoots);
  if (isFunction(handler)) {
    delegatedRoots.set(domNode, {
      eventHandler: (e) => {
        if (parsedEvent.stop) {
          e.stopPropagation();
        }
        handler(e);
      },
      event,
    });
  }
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
  const parsedEvent = parseEventName(eventName);
  const delegatedRoots = delegatedEvents.get(normalizeEventName(eventName));
  const event = delegatedRoots.get(domNode);
  if (event) {
    domNode.removeEventListener(parsedEvent.name, event.event, false);
    /* istanbul ignore next */
    const delegatedRootsSize = delegatedRoots.size;
    if (delegatedRoots.delete(domNode) && delegatedRootsSize === 0) {
      delegatedEvents.delete(normalizeEventName(eventName));
    }
  }
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

function normalizeEventName(eventName: string) {
  const reg = /^(on|bind|catch|capture-bind|capture-catch)/;

  return eventName.replace(reg, '');
}

function fixEvent(node: Element, eventName: string) {
  const tapEventReg = /([Tt]ap)$/;
  if (eventName === 'onDoubleClick') {
    eventName = 'ondblclick';
  } else if (eventName === 'onTouchTap') {
    eventName = 'onclick';
    // tslint:disable-next-line:prefer-conditional-expression
  } else if (eventName === 'onChange' && detectCanUseOnInputNode(node)) {
    eventName = ONINPUT in window ? ONINPUT : ONPROPERTYCHANGE;
  } else if (tapEventReg.test(eventName)) {
    eventName = eventName.replace(tapEventReg, 'click');
  } else {
    eventName = eventName.toLowerCase();
  }
  return eventName;
}

function parseEventName(name) {
  let event: any = null;

  if (name.startsWith('on')) {
    event = {
      raw: name,
      name: name.slice(2),
      stop: false,
    };
  } else if (name.startsWith('bind')) {
    event = {
      raw: name,
      name: name.slice(4),
      stop: false,
    };
  } else if (name.startsWith('catch')) {
    event = {
      raw: name,
      name: name.slice(5),
      stop: true,
    };
  } else if (name.startsWith('capture-bind')) {
    event = {
      raw: name,
      name: name.slice(12),
      stop: false,
      capture: true,
    };
  } else if (name.startsWith('capture-catch')) {
    event = {
      raw: name,
      name: name.slice(13),
      stop: true,
      capture: true,
    };
  }

  return event;
}

function attachEventToNode(node, parsedEvent, delegatedRoots) {
  const eventHandler = (event) => {
    const eventToTrigger = delegatedRoots.get(node);
    if (eventToTrigger && eventToTrigger.eventHandler) {
      const eventData = {
        currentTarget: node,
      };
      /* istanbul ignore next */
      Object.defineProperties(event, {
        currentTarget: {
          configurable: true,
          get() {
            return eventData.currentTarget;
          },
        },
      });
      eventToTrigger.eventHandler(event);
    }
  };

  node.addEventListener(parsedEvent.name, eventHandler, parsedEvent.capture || supportedPassiveEventMap[parsedEvent.name] || false);

  return eventHandler;
}
