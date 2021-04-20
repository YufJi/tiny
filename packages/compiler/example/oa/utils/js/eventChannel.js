let eventChannel = {};

let eventMap = {};
let eventQueue = [];

eventChannel.on = function (eventName, fn) {
  if (!eventMap.hasOwnProperty(eventName)) {
    eventMap[eventName] = [fn];
    let events = [];
    eventQueue = eventQueue.filter((event) => {
      if (event.eventName == eventName) {
        events.push(event);
        return false;
      }
      return true;
    });
    events.forEach((event) => {
      eventChannel.emit(event.eventName, ...event.args);
    });
  } else {
    eventMap[eventName].push(fn);
  }
  return fn;
};

eventChannel.off = function (eventName, fn) {
  if (!fn) {
    delete eventMap[eventName];
  } else {
    if (eventMap.hasOwnProperty(eventName)) {
      eventMap[eventName] = eventMap[eventName].filter((item) => {
        return item !== fn;
      });
      if (!eventMap[eventName].length) {
        delete eventMap[eventName];
      }
    }
  }
};

eventChannel.emit = function (eventName, ...args) {
  if (eventMap.hasOwnProperty(eventName)) {
    eventMap[eventName].forEach((fn) => {
      fn(...args);
    });
  } else {
    eventQueue.push({
      eventName,
      args
    });
  }
};

module.exports = eventChannel;