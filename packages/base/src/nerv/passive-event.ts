const defaultOptions = {
  passive: false,
  capture: false,
};

export let supportPassive = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportPassive = true;
    },
  });
  window.addEventListener('testPassive', null as any, opts);
  window.removeEventListener('testPassive', null as any, opts);
} catch (e) {
  supportPassive = false;
}

function getDefaultPassiveOption() {
  const passiveOption = supportPassive ? defaultOptions : false;
  return () => {
    return passiveOption;
  };
}

const getPassiveOption = getDefaultPassiveOption();

export const supportedPassiveEventMap = {
  scroll: getPassiveOption(),
  wheel: getPassiveOption(),
  touchstart: getPassiveOption(),
  touchmove: getPassiveOption(),
  touchenter: getPassiveOption(),
  touchend: getPassiveOption(),
  touchleave: getPassiveOption(),
  mouseout: getPassiveOption(),
  mouseleave: getPassiveOption(),
  mouseup: getPassiveOption(),
  mousedown: getPassiveOption(),
  mousemove: getPassiveOption(),
  mouseenter: getPassiveOption(),
  mousewheel: getPassiveOption(),
  mouseover: getPassiveOption(),
};
