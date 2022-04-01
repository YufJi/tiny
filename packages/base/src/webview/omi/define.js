import options from './options';

export function define(name, ctor, config) {
  if (customElements.get(name)) {
    return;
  }
  if (options.mapping[name]) {
    return;
  }

  customElements.define(name, ctor);
  options.mapping[name] = ctor;
}
