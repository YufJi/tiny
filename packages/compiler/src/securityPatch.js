(function (g) {
  // es5
  const empty = {};
  function FakeFunction() {
    if (arguments.length > 0 && arguments[arguments.length - 1] === 'return this') {
      return function () {
        return empty;
      };
    }
  }

  function securityPatch() {
    if (typeof Function !== 'undefined') {
      // make sure function t(){} instanceof Function === true
      FakeFunction.prototype = Function.prototype;
      FakeFunction.prototype.constructor = FakeFunction;
      g.Function = FakeFunction;
    }

    g.eval = null;
  }

  if (!g.__securityPatched) {
    g.__securityPatched = 1;
    securityPatch();
  }
})(typeof global !== 'undefined' ? global : self);
