import { h, h as createElement } from './h';
import options from './options';
import WeElement from './we-element';
import { define } from './define';
import { cloneElement } from './clone-element';
import { Fragment } from './util';

const elements = options.mapping;

const omi = {
  WeElement,
  h,
  createElement,
  Fragment,
  define,
  cloneElement,
  elements,
  options,
};

options.root.Omi = omi;
options.root.omi = omi;

export default omi;

export {
  WeElement,
  h,
  createElement,
  Fragment,
  define,
  cloneElement,
  elements,
  options,
};
