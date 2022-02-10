import { addListener, eventProxy, toEventName } from 'shared';

export default function bindEvent(
  dom,
  eventName,
  nextEvent,
  lastEvent,
) {
  const { raw, name, options } = toEventName(eventName);
  const { capture } = options;

  const listener = dom._listeners || (dom._listeners = {});

  listener[`${name}`] = listener[`${name}`] || {};

  /* 每个dom某个事件只注册一次 */
  if (!lastEvent && !listener[`${name}`][`${capture ? 'capture' : 'bubble'}`]) {
    const fn = eventProxy.bind(dom, name, capture);

    addListener(dom, name, fn, options);
  }

  const methodName = nextEvent.name;

  listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = {
    options,
    handler: nextEvent,
    name: methodName,
  };

  dom.setAttribute(raw, methodName);
}
