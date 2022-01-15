import { transformRpx } from '@/webview/util';

export default function bindAnimation(dom, nextAnimationValue) {
  if (!nextAnimationValue?.steps?.length) return;

  const animationData = nextAnimationValue;

  const actions = animationData.steps.map(animationToAction);
  let idx = 0;

  if (dom._transitionEnd_) {
    dom.removeEventListener('transitionend', dom._transitionEnd_);
  }
  dom._transitionEnd_ = function () {
    if (actions[++idx]) {
      drain(actions[idx], dom);
    }
  };
  dom.addEventListener('transitionend', dom._transitionEnd_);
  drain(actions[idx], dom);
}

function animationToAction(step) {
  const { text, option } = step;
  const { delay, duration, timingFunction, transformOrigin } = option || {};

  if (!text.includes('transition')) {
    return {
      style: {},
      transform: '',
      transition: '',
      transformOrigin: '',
      transitionProperty: 'transform',
    };
  }

  const operation = text.split(';').map((item) => {
    return item.trim();
  }).filter((item) => {
    return item !== '';
  }).reduce((prev, cur) => {
    const [key, value] = cur.split(':');
    if (['transition', 'transform-origin'].indexOf(key) === -1) {
      key === 'transform' ? prev.transform = value : prev.style[key] = value;
    }

    return prev;
  }, { transform: '', style: {} });

  const { style, transform } = operation;

  return {
    style,
    transform,
    transformOrigin,
    transition: `${duration}ms ${timingFunction} ${delay}ms`,
    transitionProperty: ['transform'].concat(Object.keys(style)).join(','),
  };
}

function drain(action, dom) {
  const { style, transform, transition, transformOrigin, transitionProperty } = action;
  dom.style.transition = transition;
  dom.style.transitionProperty = transitionProperty;
  dom._animationStyle_ = stringifyAnimation({
    transform,
    transition,
    transformOrigin,
    transitionProperty,
  });
  dom.style.transform = transform;
  dom.style.transformOrigin = transformOrigin;
  Object.keys(style).forEach((key) => {
    dom.style[key] = transformRpx(`:${style[key]}`).slice(1);
  });
}

function stringifyAnimation(animationStyle) {
  return Object.keys(animationStyle)
    .filter((key) => {
      return animationStyle[key] !== '';
    })
    .map((key) => {
      return `${camel2Kebab(key)}:${animationStyle[key]}`;
    })
    .join(';');
}

function camel2Kebab(str) {
  return str.replace(/([A-Z]{1})/g, (match) => {
    return `-${match.toLowerCase()}`;
  });
}
