import { h, h as createElement } from './h';
import options from './options';
import WeElement from './we-element';
import { render } from './render';
import { define } from './define';
import { tag } from './tag';
import { cloneElement } from './clone-element';
import { getHost } from './get-host';
import { Fragment } from './util';

h.f = Fragment;

const $ = {};
const Component = WeElement;
const defineElement = define;
const elements = options.mapping;

const omi = {
  tag,
  WeElement,
  Component,
  render,
  h,
  createElement,
  Fragment,
  options,
  define,
  cloneElement,
  getHost,
  defineElement,
  elements,
  $,
};

options.root.Omi = omi;
options.root.omi = omi;

export default omi;

export {
  tag,
  WeElement,
  Component,
  render,
  h,
  createElement,
  Fragment,
  options,
  define,
  cloneElement,
  getHost,
  defineElement,
  elements,
  $,
};
