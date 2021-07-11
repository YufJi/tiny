/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:25:36
 * @LastEditTime: 2021-07-10 03:57:45
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/preact/index.js
 */
import { render, hydrate } from './render';

import {
  createElement,
  Fragment,
  createRef,
  isValidElement,
} from './create-element';

import { Component } from './component';
import { cloneElement } from './clone-element';
import { createContext } from './create-context';
import { toChildArray, Children } from './diff/children';
import options from './options';

import {
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useImperativeHandle,
  useLayoutEffect,
  useDangerousReverseLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from './hooks';

export {
  render,
  hydrate,

  createElement,
  createElement as h,
  Fragment,
  createRef,
  isValidElement,

  Component,
  cloneElement,
  createContext,
  Children,
  toChildArray,
  options,

  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useImperativeHandle,
  useLayoutEffect,
  useDangerousReverseLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
};
