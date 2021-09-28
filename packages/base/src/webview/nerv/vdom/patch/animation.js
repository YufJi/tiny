import { nextTick, transformRpx } from '../..';

let active = false;
const animationQueue = [];

export default function patchAnimation(nextAnimationValue, dom) {
  if (!nextAnimationValue?.steps?.length) return;

  const handler = () => {
    active = true;
    const actions = nextAnimationValue.steps.map(animationToAction);
    let count = 0;

    dom.removeEventListener('transitionend', dom._transitionEnd_);
    dom._transitionEnd_ = function () {
      count+=1;
      if (count < actions.length) {
        drain(actions[count], dom);
      } else if (animationQueue.length) {
        const task = animationQueue.shift();
        task();
      } else {
        active = false;
      }
    };
    dom.addEventListener('transitionend', dom._transitionEnd_);

    drain(actions[count], dom);
  };

  if (active) {
    animationQueue.push(handler);
  } else {
    nextTick(handler);
  }
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
