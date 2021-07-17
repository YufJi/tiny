/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:39:24
 * @LastEditTime: 2021-07-13 17:44:13
 * @Description:
 * @FilePath: /yeact/src/index.js
 */

import { nextTick } from './utils';
import { Children } from './children';
import Component from './component';
import PureComponent from './pure-component';
import render from './render';
import createElement from './create-element';
import cloneElement from './clone-element';

import { hydrate } from './hydrate';
import options from './options';
import { createPortal } from './vdom/create-portal';
import {
  unmountComponentAtNode,
  findDOMNode,
  unstable_renderSubtreeIntoContainer,
  createFactory,
  unstable_batchedUpdates,
  isValidElement,
} from './dom';
import { getHooks, useEffect, useLayoutEffect, useDangerousReverseLayoutEffect, useReducer, useState, useRef, useCallback, useMemo, useImperativeHandle, useContext } from './hooks';
import { createRef, forwardRef } from './create-ref';
import { memo } from './memo';
import { createContext } from './create-context';
import { renderComponent } from './lifecycle';
import Current from './current-owner';
import Fragment from './fragment';
import h from './vdom/h';

export {
  Children,
  Component,
  PureComponent,
  createElement,
  createElement as h,
  cloneElement,
  render,
  nextTick,
  options,
  findDOMNode,
  isValidElement,
  unmountComponentAtNode,
  createPortal,
  unstable_renderSubtreeIntoContainer,
  hydrate,
  createFactory,
  unstable_batchedUpdates,
  createRef,
  forwardRef,
  memo,
  createContext,
  renderComponent,
  getHooks,
  Current,
  Fragment,
  useEffect,
  useLayoutEffect,
  useDangerousReverseLayoutEffect,
  useReducer,
  useState,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  useContext,
};

export default {
  Children,
  Component,
  PureComponent,
  createElement,
  h: createElement,
  cloneElement,
  render,
  nextTick,
  options,
  findDOMNode,
  isValidElement,
  unmountComponentAtNode,
  createPortal,
  unstable_renderSubtreeIntoContainer,
  hydrate,
  createFactory,
  unstable_batchedUpdates,
  createRef,
  forwardRef,
  memo,
  createContext,
  renderComponent,
  getHooks,
  Current,
  Fragment,
  useEffect,
  useLayoutEffect,
  useDangerousReverseLayoutEffect,
  useReducer,
  useState,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  useContext,
};
