
import objectKeys from './objectKeys';

export default function addEvents(target, fns) {
  const names = objectKeys(fns);
  names.forEach((name) => {
    target.addEventListener(name, fns[name]);
  });
  return {
    remove: function remove() {
      names.forEach((name) => {
        target.removeEventListener(name, fns[name]);
      });
    },
  };
}
