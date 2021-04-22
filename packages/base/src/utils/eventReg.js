export const eventReg = /^(bind|catch)\$([A-Za-z_]+)(\$capture)?$/;

export const commonBubblesEvents = [
  'tap',

  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',

  'transitionend',

  'animationstart',
  'animationiteration',
  'animationend',
];

export const commonBubblesEventsReg = new RegExp(`(bind|catch)\$(${commonBubblesEvents.join('|')})(\$capture)?$`);

export function getPropsEventName(name, isCatch = false, capture = false) {
  const arr = [];
  arr.push(isCatch ? 'catch' : 'bind');
  if (name) {
    arr.push(name);
  }
  if (capture) {
    arr.push('capture');
  }

  return arr.join('$');
}
