import React from 'react';
import { Toast, Picker, DatePicker } from 'antd-mobile';
import { ExclamationCircleOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';

import global from '@/utils/global';
import store from '@/store';
import { forEachWebviewIds } from './util';

const { dispatch } = store;

export function showToast(params, webviewIds, callbackId) {
  const { title, icon, duration, mask } = params;

  switch (icon) {
    case 'success':
    case 'loading':
      Toast.show({
        icon: 'success',
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;
    case 'error':
      Toast.show({
        icon: <ExclamationCircleOutline />,
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;
    case 'none':
      Toast.show({
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;

    default:
      break;
  }

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'showToast:ok' })}')`);
}

export function hideToast(params, webviewIds, callbackId) {
  Toast.clear();

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'hideToast:ok' })}')`);
}

export function setNavigationBarTitle(params, webviewIds, callbackId) {
  const { title } = params;

  dispatch.nav.setTitle(title);

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'setNavigationBarTitle:ok' })}')`);
}

function onCancelPicker(method, render, callbackId) {
  render.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: `${method}:cancel` })}')`);
}

export function showPickerView(params, webviewIds, callbackId) {
  const { array, current } = params;
  const columns = array.map((label, idx) => ({
    label,
    value: idx,
  }));

  Picker.prompt({
    columns: [columns],
    value: [current],
    onConfirm: (value) => {
      forEachWebviewIds(webviewIds, (render) => {
        render.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ index: value[0] })}')`);
      });
    },
    onCancel: () => {
      forEachWebviewIds(webviewIds, (render) => {
        onCancelPicker('showPickerView', render, callbackId);
      });
    },
  });
}

export function showMultiPickerView(params, webviewIds, callbackId) {
  const { array, current } = params;
  const columns = array.map((column) => {
    return column.map((label, idx) => ({
      label,
      value: idx,
    }));
  });

  Picker.prompt({
    columns,
    value: current,
    onConfirm: (value) => {
      forEachWebviewIds(webviewIds, (render) => {
        render.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ current: value })}')`);
      });
    },
    onCancel: () => {
      forEachWebviewIds(webviewIds, (render) => {
        onCancelPicker('showMultiPickerView', render, callbackId);
      });
    },
  });
}

export function updateMultiPickerView() {

}

export function showDatePickerView(params, webviewIds, callbackId) {
  const { range, mode, current, fields } = params;
  const { start, end } = range;

  if (mode === 'date') {
    DatePicker.prompt({
      value: new Date(current),
      min: new Date(start),
      max: new Date(end),
      precision: fields,
      onConfirm: (value) => {
        const date = dayjs(value).format('YYYY-MM-DD');
        forEachWebviewIds(webviewIds, (render) => {
          render.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ value: date })}')`);
        });
      },
      onCancel: () => {
        forEachWebviewIds(webviewIds, (render) => {
          onCancelPicker('showDatePickerView', render, callbackId);
        });
      },
    });
  }
}
