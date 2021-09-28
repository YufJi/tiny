const g = typeof global !== 'undefined' ? global : self;

const empty = {};
function FakeFunction(...args) {
  if (args.length > 0 && args[args.length - 1] === 'return this') {
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
