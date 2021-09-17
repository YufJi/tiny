import { isFunction } from 'lodash';

const cbs = {
  Show: [],
  Hide: [],
};

function onMethodPrototype(event) {
  function method(cb) {
    if (!isFunction(cb)) {
      throw new Error(`onApp${event} should accept a function instead of ${typeof cb}`);
    }

    cbs[event].push(cb);
  }

  return method;
}

function offMethodPrototype(event) {
  function method(cb) {
    if (!isFunction(cb) && cb !== undefined) {
      throw new Error(`offApp${event} should accept a function instead of ${typeof cb}`);
    }

    remove(cbs[event], cb);
  }

  return method;
}

const onAppShow = onMethodPrototype('Show');
const onAppHide = onMethodPrototype('Hide');
const offAppShow = offMethodPrototype('Show');
const offAppHide = offMethodPrototype('Hide');

function triggerMethodPrototype(event) {
  const method = function method(param) {
    cbs[event].forEach((cb) => {
      return cb(param);
    });
  };

  return method;
}

const triggerHideCbs = triggerMethodPrototype('Hide');
const triggerShowCbs = triggerMethodPrototype('Show');

function remove(arr, val) {
  if (val === undefined) {
    arr.splice(0, arr.length);
    return;
  }

  const index = arr.indexOf(val);

  if (index > -1) {
    arr.splice(index, 1);
  }
}

export {
  triggerHideCbs,
  triggerShowCbs,

  onAppHide,
  onAppShow,
  offAppHide,
  offAppShow,
};
