
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import bridge from '@/apis/';
import {
  Button,
  Canvas,
  CheckBox,
  CheckBoxGroup,
  Icon,
  Image,
  Input,
  Label,
  Picker,
  Radio,
  RadioGroup,
  ScrollView,
  Text,
  View,
} from '@/components/';

import {
  EventHub,
  App,
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getApp,
  getAppImpl,
  getCurrentPages,
  getStartupParams,
  setStartupParams,
  Component,
  getComponentClass,
  StyleSheet,
  createComponent,
  Page,
  $global,
} from './framework/';

import RMLRuntime from './rml-runtime';

const __mpStartTime = Date.now();

const g = self;

g.React = React;
g.ReactDOM = ReactDOM;
g.createReactClass = createReactClass;
g.React.createClass = g.React.createClass || createReactClass;
g.RMLRuntime = RMLRuntime;
g.MPUI = {
  button: Button,
  canvas: Canvas,
  checkbox: CheckBox,
  'checkbox-group': CheckBoxGroup,
  icon: Icon,
  image: Image,
  input: Input,
  label: Label,
  picker: Picker,
  radio: Radio,
  'radio-group': RadioGroup,
  'scroll-view': ScrollView,
  text: Text,
  view: View,
};

self.MP = {
  bridge,
  EventHub,
  App,
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getApp,
  getAppImpl,
  getCurrentPages,
  getStartupParams,
  setStartupParams,
  Component,
  getComponentClass,
  StyleSheet,
  createComponent,
  Page,
  $global,
};

const __mpCosts = Date.now() - __mpStartTime;
console.log(`framework: web bundle costs ${__mpCosts} ms`);
