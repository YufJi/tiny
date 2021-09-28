import { transformRpx } from '../..';
import { isString, isNumber } from '../../utils';
import { isNil } from '../../shared';

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

export default function patchStyle(lastAttrValue, nextAttrValue, dom) {
  let style;
  let value;

  if (isString(nextAttrValue)) {
    let animationStyle = dom._animationStyle_ || '';
    if (animationStyle) {
      animationStyle += ';';
    }

    dom.style.cssText = transformRpx(`${animationStyle}${nextAttrValue}`);

    return;
  }
  if (!isNil(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        setStyle(dom.style, style, transformRpx(value));
      }
    }
    for (style in lastAttrValue) {
      if (isNil(nextAttrValue[style])) {
        dom.style[style] = '';
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      setStyle(dom.style, style, transformRpx(value));
    }
  }
}

function setStyle(domStyle, style, value) {
  if (isNil(value) || (isNumber(value) && isNaN(value))) {
    domStyle[style] = '';
    return;
  }
  if (style === 'float') {
    domStyle.cssFloat = value;
    domStyle.styleFloat = value;
    return;
  }
  domStyle[style] = !isNumber(value) || IS_NON_DIMENSIONAL.test(style) ? value : `${value}px`;
}
