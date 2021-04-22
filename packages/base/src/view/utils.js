const lengthCssPropNames = {
  width: 1,
  height: 1,
  top: 1,
  left: 1,
  bottom: 1,
  right: 1,
};
const colorCssPropNames = {
  opacity: 1,
  backgroundColor: 1,
};
const translateProperties = {
  translateX: 1,
  translateY: 1,
  translateZ: 1,
};
const rotateProperties = {
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1,
};
const skewProperties = {
  skewX: 1,
  skewY: 1,
};
function expandAnimation(animation) {
  const ret = [];
  animation.forEach((a) => {
    const p = a[0];
    const value = a[1];
    if (p === 'rotate') {
      ret.push(['rotateZ', value]);
    } else if (p === 'scale') {
      ret.push(['scaleX', [value[0]]]);
      ret.push(['scaleY', value[1] !== undefined ? [value[1]] : [value[0]]]);
    } else if (p === 'scale3d') {
      ret.push(['scaleX', [value[0]]]);
      ret.push(['scaleY', [value[1]]]);
      ret.push(['scaleZ', [value[2]]]);
    } else if (p === 'translate') {
      ret.push(['translateX', [value[0]]]);
      ret.push(['translateY', [value[1]]]);
    } else if (p === 'translate3d') {
      ret.push(['translateX', [value[0]]]);
      ret.push(['translateY', [value[1]]]);
      ret.push(['translateZ', [value[2]]]);
    } else if (p === 'skew') {
      ret.push(['skewX', [value[0]]]);
      ret.push(['skewY', [value[1]]]);
    } else {
      ret.push(a);
    }
  });
  return ret;
}

export {
  lengthCssPropNames,
  colorCssPropNames,
  translateProperties,
  rotateProperties,
  skewProperties,
  expandAnimation,
};
