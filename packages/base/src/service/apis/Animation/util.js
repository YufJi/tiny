export function pinOneAction(oneAction) {
  const oneAnimates = oneAction.animates;
  const oneOption = oneAction.option;
  const transformString = oneAnimates.filter((animate) => {
    return animate.type !== 'style';
  }).map((animate) => {
    const property = animate.type;
    let values = animate.args;

    switch (property) {
      case 'matrix':
        return `matrix(${values.join(',')})`;

      case 'matrix3d':
        return `matrix3d(${values.join(',')})`;

      case 'rotate':
        values = values.map(plusDeg);
        return `rotate(${values[0]})`;

      case 'rotate3d':
        const deg = values[3];

        if (deg && !String(deg).endsWith('deg')) {
          values[3] = plusDeg(deg);
        }

        return `rotate3d(${values.join(',')})`;

      case 'rotateX':
        values = values.map(plusDeg);
        return `rotateX(${values[0]})`;

      case 'rotateY':
        values = values.map(plusDeg);
        return `rotateY(${values[0]})`;

      case 'rotateZ':
        values = values.map(plusDeg);
        return `rotateZ(${values[0]})`;

      case 'scale':
        return `scale(${values.join(',')})`;

      case 'scale3d':
        return `scale3d(${values.join(',')})`;

      case 'scaleX':
        return `scaleX(${values[0]})`;

      case 'scaleY':
        return `scaleY(${values[0]})`;

      case 'scaleZ':
        return `scaleZ(${values[0]})`;

      case 'translate':
        values = values.map(plusPx);
        return `translate(${values.join(',')})`;

      case 'translate3d':
        values = values.map(plusPx);
        return `translate3d(${values.join(',')})`;

      case 'translateX':
        values = values.map(plusPx);
        return `translateX(${values[0]})`;

      case 'translateY':
        values = values.map(plusPx);
        return `translateY(${values[0]})`;

      case 'translateZ':
        values = values.map(plusPx);
        return `translateZ(${values[0]})`;

      case 'skew':
        values = values.map(plusDeg);
        return `skew(${values.join(',')})`;

      case 'skewX':
        values = values.map(plusDeg);
        return `skewX(${values[0]})`;

      case 'skewY':
        values = values.map(plusDeg);
        return `skewY(${values[0]})`;

      default:
        return '';
    }
  }).join(' ');
  const styleMap = oneAnimates.filter((animate) => {
    return animate.type === 'style';
  }).reduce((result, animate) => {
    // eslint-disable-next-line prefer-destructuring
    result[animate.args[0]] = animate.args[1];
    return result;
  }, {});

  let css = ';';

  for (const i in styleMap) {
    css += `${i}: ${styleMap[i]}; `;
  }

  if (oneOption.transformOrigin) {
    css += `transform-origin: ${oneOption.transformOrigin}; `; // add px
  }

  const transition = `${oneOption.duration}ms ${oneOption.timingFunction} ${oneOption.delay}ms`;
  let transStyles = ['transform'];

  if (Object.keys(styleMap).length > 0) {
    transStyles = transStyles.concat(Object.keys(styleMap));
  }

  css += 'transition: ';
  css += transStyles.map((pro) => {
    return `${pro} ${transition}`;
  }).join(' , ');
  css += ';';

  if (transformString) {
    css += `transform: ${transformString};`;
  }

  return css;
}

function plusDeg(e) {
  return `${e}deg`;
}

function plusPx(e) {
  return typeof e === 'number' ? `${e}px` : e;
}

export function toDashcase(str) {
  return str.replace(/[A-Z]/g, (code) => {
    return `-${code.toLowerCase()}`;
  });
}
