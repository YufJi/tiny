
export default function securityPatch() {
  const g = self;
  if (typeof Function !== 'undefined') {
    // make sure function t(){} instanceof Function === true
    const empty = {};
    const FakeFunction = function FakeFunction() {
      if (arguments.length > 0 && arguments[arguments.length - 1] === 'return this') {
        return function () {
          return empty;
        };
      }
    };

    FakeFunction.prototype = Function.prototype;
    FakeFunction.prototype.constructor = FakeFunction;
    g.Function = FakeFunction;
  }
  // g.eval = null;
  const originalSetTimeout = setTimeout;
  const originalSetInterval = setInterval;
  g.setTimeout = function (fn, time) {
    if (typeof fn !== 'function') {
      return;
    }
    return originalSetTimeout(fn, time);
  };
  g.setInterval = function (fn, time) {
    if (typeof fn !== 'function') {
      return;
    }
    return originalSetInterval(fn, time);
  };
}
