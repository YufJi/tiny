import EventEmitter from 'eventemitter3';

const emitter = new EventEmitter();

export function subscribe(event: string, callback: (...args: any[]) => void) {
  emitter.on(event, callback);
}

export function nativeSubscribeHandler(event: string, data: any) {
  emitter.emit(event, data);
}
