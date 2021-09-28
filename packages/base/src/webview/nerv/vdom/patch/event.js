import { addListener, eventProxy, toEventName } from '../../event';

export default function patchEvent(
  eventName,
  lastEvent,
  nextEvent,
  domNode,
) {
  const { raw, name, options } = toEventName(eventName);
  const { capture } = options;

  const listener = domNode._listeners || (domNode._listeners = {});
  const callback = domNode._callback || (domNode._callback = {});

  listener[`${name}`] = listener[`${name}`] || {};

  if (nextEvent) {
    /* 每个dom只注册一次事件 */
    if (!lastEvent) {
      const fn = eventProxy.bind(domNode, name, capture);
      callback[raw] = fn;
      addListener(domNode, name, fn, options);
    }

    const eventName = nextEvent.name;

    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = {
      options,
      handler: nextEvent,
      name: eventName,
    };
    domNode.setAttribute(raw, eventName);
  } else {
    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = null;
    domNode.removeAttribute(raw);
  }
}
