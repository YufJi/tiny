import { addListener, eventProxy, toEventName } from 'shared/addListener';

export default function bindEvent(
  dom,
  eventName,
  nextEvent,
  lastEvent,
) {
  const { raw, name, options } = toEventName(eventName);
  const { capture } = options;

  const listener = dom._listeners || (dom._listeners = {});
  const callback = dom._callback || (dom._callback = {});

  listener[`${name}`] = listener[`${name}`] || {};

  if (nextEvent) {
    /* 每个dom只注册一次事件 */
    if (!lastEvent) {
      const fn = eventProxy.bind(dom, name, capture);
      callback[raw] = fn;
      addListener(dom, name, fn, options);
    }

    const eventName = nextEvent.name;

    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = {
      options,
      handler: nextEvent,
      name: eventName,
    };
    dom.setAttribute(raw, eventName);
  } else {
    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = null;
    dom.removeAttribute(raw);
  }
}
