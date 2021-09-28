export default class Emitter {
  constructor(value) {
    this.value = value;
    this.handlers = [];
  }

  on(handler) {
    this.handlers.push(handler);
  }

  off(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  set(value) {
    this.value = value;
    this.handlers.forEach((h) => h(this.value));
  }
}
