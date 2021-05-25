import objectKeys from './objectKeys';

export default function addEvents(target, fns) {
  const names = objectKeys(fns);
  names.forEach((name) => {
    target.addEventListener(name, fns[name]);
  });
  return {
    remove() {
      names.forEach((name) => {
        target.removeEventListener(name, fns[name]);
      });
    },
  };
}

export function addEvent(target, name, fn) {
  target.addEventListener(name, fn);

  return {
    remove() {
      target.removeEventListener(name, fn);
    },
  };
}
