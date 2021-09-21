import EventEmitter from 'eventemitter3';

// 使用过的webview
export const webviewUsed = new Map();
// 页面栈
export const pageStack = [];
// events
export const emitter = new EventEmitter();
