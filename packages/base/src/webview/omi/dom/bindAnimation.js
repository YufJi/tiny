import transformRpx from '@/webview/util/transformRpx';

export default function bindAnimation(dom, nextAnimationValue) {
  if (!nextAnimationValue?.steps?.length) return;

  const animationData = nextAnimationValue;

  const actions = animationData.steps.map(animationToAction);
  let idx = 0;
  const firstAction = actions[0];
  const restActions = actions.slice(1);
  const restLen = restActions.length;

  if (dom._transitionEnd_) {
    dom.removeEventListener('transitionend', dom._transitionEnd_);
  }
  dom._transitionEnd_ = function () {
    if (idx < restLen) {
      drain(restActions[idx], dom);
      idx+=1;
    }
  };
  dom.addEventListener('transitionend', dom._transitionEnd_);
  drain(firstAction, dom);
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
