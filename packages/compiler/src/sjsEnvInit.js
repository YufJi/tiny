(function (g) {
  // es5
  const PREFIX = '$sjs_';
  const PREFIX_LENGTH = PREFIX.length;

  function sjsInitObject() {
    Object.defineProperty(Object.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Object',
    });
    Object.defineProperty(Object.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return '[object Object]';
      },
    });
  }

  function sjsInitFunction() {
    Object.defineProperty(Function.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Function',
    });
    Object.defineProperty(Function.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set() {},
    });
    Object.defineProperty(Function.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return '[function Function]';
      },
    });
  }

  function sjsInitArray() {
    Object.defineProperty(Array.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return this[`${PREFIX}join`]();
      },
    });
    Object.defineProperty(Array.prototype, `${PREFIX}join`, {
      writable: true,
      value: function value(s) {
        s = undefined === s ? ',' : s;
        let r = '';
        for (let i = 0; i < this.length; ++i) {
          if (i !== 0) {
            r += s;
          }
          if (this[i] === null || this[i] === undefined) {
            r += '';
          } else if (typeof this[i] === 'function') {
            r += this[i][`${PREFIX}toString`]();
          } else if (
            typeof this[i] === 'object'
            && this[i][`${PREFIX}constructor`] === 'Array'
          ) {
            r += this[i][`${PREFIX}join`]();
          } else {
            r += this[i].toString();
          }
        }
        return r;
      },
    });
    Object.defineProperty(Array.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Array',
    });
    Object.defineProperty(Array.prototype, `${PREFIX}concat`, {
      writable: true,
      value: Array.prototype.concat,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}pop`, {
      writable: true,
      value: Array.prototype.pop,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}push`, {
      writable: true,
      value: Array.prototype.push,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reverse`, {
      writable: true,
      value: Array.prototype.reverse,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}shift`, {
      writable: true,
      value: Array.prototype.shift,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}slice`, {
      writable: true,
      value: Array.prototype.slice,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}sort`, {
      writable: true,
      value: Array.prototype.sort,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}splice`, {
      writable: true,
      value: Array.prototype.splice,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}unshift`, {
      writable: true,
      value: Array.prototype.unshift,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}indexOf`, {
      writable: true,
      value: Array.prototype.indexOf,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}lastIndexOf`, {
      writable: true,
      value: Array.prototype.lastIndexOf,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}every`, {
      writable: true,
      value: Array.prototype.every,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}some`, {
      writable: true,
      value: Array.prototype.some,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}forEach`, {
      writable: true,
      value: Array.prototype.forEach,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}map`, {
      writable: true,
      value: Array.prototype.map,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}filter`, {
      writable: true,
      value: Array.prototype.filter,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reduce`, {
      writable: true,
      value: Array.prototype.reduce,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reduceRight`, {
      writable: true,
      value: Array.prototype.reduceRight,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set(value) {
        this.length = value;
      },
    });
  }

  function sjsInitString() {
    Object.defineProperty(String.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'String',
    });
    Object.defineProperty(String.prototype, `${PREFIX}toString`, {
      writable: true,
      value: String.prototype.toString,
    });
    Object.defineProperty(String.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: String.prototype.valueOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}charAt`, {
      writable: true,
      value: String.prototype.charAt,
    });
    Object.defineProperty(String.prototype, `${PREFIX}charCodeAt`, {
      writable: true,
      value: String.prototype.charCodeAt,
    });
    Object.defineProperty(String.prototype, `${PREFIX}concat`, {
      writable: true,
      value: String.prototype.concat,
    });
    Object.defineProperty(String.prototype, `${PREFIX}indexOf`, {
      writable: true,
      value: String.prototype.indexOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}lastIndexOf`, {
      writable: true,
      value: String.prototype.lastIndexOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}localeCompare`, {
      writable: true,
      value: String.prototype.localeCompare,
    });
    Object.defineProperty(String.prototype, `${PREFIX}match`, {
      writable: true,
      value: String.prototype.match,
    });
    Object.defineProperty(String.prototype, `${PREFIX}replace`, {
      writable: true,
      value: String.prototype.replace,
    });
    Object.defineProperty(String.prototype, `${PREFIX}search`, {
      writable: true,
      value: String.prototype.search,
    });
    Object.defineProperty(String.prototype, `${PREFIX}slice`, {
      writable: true,
      value: String.prototype.slice,
    });
    Object.defineProperty(String.prototype, `${PREFIX}split`, {
      writable: true,
      value: String.prototype.split,
    });
    Object.defineProperty(String.prototype, `${PREFIX}substring`, {
      writable: true,
      value: String.prototype.substring,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLowerCase`, {
      writable: true,
      value: String.prototype.toLowerCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLocaleLowerCase`, {
      writable: true,
      value: String.prototype.toLocaleLowerCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toUpperCase`, {
      writable: true,
      value: String.prototype.toUpperCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLocaleUpperCase`, {
      writable: true,
      value: String.prototype.toLocaleUpperCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}trim`, {
      writable: true,
      value: String.prototype.trim,
    });
    Object.defineProperty(String.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set(value) {
        this.length = value;
      },
    });
  }

  function sjsInitBoolean() {
    Object.defineProperty(Boolean.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Boolean',
    });
    Object.defineProperty(Boolean.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Boolean.prototype.toString,
    });
    Object.defineProperty(Boolean.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Boolean.prototype.valueOf,
    });
  }

  function sjsInitNumber() {
    Object.defineProperty(Number, `${PREFIX}MAX_VALUE`, {
      writable: false,
      value: Number.MAX_VALUE,
    });
    Object.defineProperty(Number, `${PREFIX}MIN_VALUE`, {
      writable: false,
      value: Number.MIN_VALUE,
    });
    Object.defineProperty(Number, `${PREFIX}NEGATIVE_INFINITY`, {
      writable: false,
      value: Number.NEGATIVE_INFINITY,
    });
    Object.defineProperty(Number, `${PREFIX}POSITIVE_INFINITY`, {
      writable: false,
      value: Number.POSITIVE_INFINITY,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Number',
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Number.prototype.toString,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toLocaleString`, {
      writable: true,
      value: Number.prototype.toLocaleString,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Number.prototype.valueOf,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toFixed`, {
      writable: true,
      value: Number.prototype.toFixed,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toExponential`, {
      writable: true,
      value: Number.prototype.toExponential,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toPrecision`, {
      writable: true,
      value: Number.prototype.toPrecision,
    });
  }

  function sjsInitMath() {
    Object.defineProperty(Math, `${PREFIX}E`, {
      writable: false,
      value: Math.E,
    });
    Object.defineProperty(Math, `${PREFIX}LN10`, {
      writable: false,
      value: Math.LN10,
    });
    Object.defineProperty(Math, `${PREFIX}LN2`, {
      writable: false,
      value: Math.LN2,
    });
    Object.defineProperty(Math, `${PREFIX}LOG2E`, {
      writable: false,
      value: Math.LOG2E,
    });
    Object.defineProperty(Math, `${PREFIX}LOG10E`, {
      writable: false,
      value: Math.LOG10E,
    });
    Object.defineProperty(Math, `${PREFIX}PI`, {
      writable: false,
      value: Math.PI,
    });
    Object.defineProperty(Math, `${PREFIX}SQRT1_2`, {
      writable: false,
      value: Math.SQRT1_2,
    });
    Object.defineProperty(Math, `${PREFIX}SQRT2`, {
      writable: false,
      value: Math.SQRT2,
    });
    Object.defineProperty(Math, `${PREFIX}abs`, {
      writable: false,
      value: Math.abs,
    });
    Object.defineProperty(Math, `${PREFIX}acos`, {
      writable: false,
      value: Math.acos,
    });
    Object.defineProperty(Math, `${PREFIX}asin`, {
      writable: false,
      value: Math.asin,
    });
    Object.defineProperty(Math, `${PREFIX}atan`, {
      writable: false,
      value: Math.atan,
    });
    Object.defineProperty(Math, `${PREFIX}atan2`, {
      writable: false,
      value: Math.atan2,
    });
    Object.defineProperty(Math, `${PREFIX}ceil`, {
      writable: false,
      value: Math.ceil,
    });
    Object.defineProperty(Math, `${PREFIX}cos`, {
      writable: false,
      value: Math.cos,
    });
    Object.defineProperty(Math, `${PREFIX}exp`, {
      writable: false,
      value: Math.exp,
    });
    Object.defineProperty(Math, `${PREFIX}floor`, {
      writable: false,
      value: Math.floor,
    });
    Object.defineProperty(Math, `${PREFIX}log`, {
      writable: false,
      value: Math.log,
    });
    Object.defineProperty(Math, `${PREFIX}max`, {
      writable: false,
      value: Math.max,
    });
    Object.defineProperty(Math, `${PREFIX}min`, {
      writable: false,
      value: Math.min,
    });
    Object.defineProperty(Math, `${PREFIX}pow`, {
      writable: false,
      value: Math.pow,
    });
    Object.defineProperty(Math, `${PREFIX}random`, {
      writable: false,
      value: Math.random,
    });
    Object.defineProperty(Math, `${PREFIX}round`, {
      writable: false,
      value: Math.round,
    });
    Object.defineProperty(Math, `${PREFIX}sin`, {
      writable: false,
      value: Math.sin,
    });
    Object.defineProperty(Math, `${PREFIX}sqrt`, {
      writable: false,
      value: Math.sqrt,
    });
    Object.defineProperty(Math, `${PREFIX}tan`, {
      writable: false,
      value: Math.tan,
    });
  }

  function sjsInitDate() {
    Object.defineProperty(Date.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Date',
    });
    Object.defineProperty(Date, `${PREFIX}parse`, {
      writable: true,
      value: Date.parse,
    });
    Object.defineProperty(Date, `${PREFIX}UTC`, {
      writable: true,
      value: Date.UTC,
    });
    Object.defineProperty(Date, `${PREFIX}now`, {
      writable: true,
      value: Date.now,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Date.prototype.toString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toDateString`, {
      writable: true,
      value: Date.prototype.toDateString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toTimeString`, {
      writable: true,
      value: Date.prototype.toTimeString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleString`, {
      writable: true,
      value: Date.prototype.toLocaleString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleDateString`, {
      writable: true,
      value: Date.prototype.toLocaleDateString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleTimeString`, {
      writable: true,
      value: Date.prototype.toLocaleTimeString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Date.prototype.valueOf,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getTime`, {
      writable: true,
      value: Date.prototype.getTime,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getFullYear`, {
      writable: true,
      value: Date.prototype.getFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCFullYear`, {
      writable: true,
      value: Date.prototype.getUTCFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMonth`, {
      writable: true,
      value: Date.prototype.getMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMonth`, {
      writable: true,
      value: Date.prototype.getUTCMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getDate`, {
      writable: true,
      value: Date.prototype.getDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCDate`, {
      writable: true,
      value: Date.prototype.getUTCDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getDay`, {
      writable: true,
      value: Date.prototype.getDay,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCDay`, {
      writable: true,
      value: Date.prototype.getUTCDay,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getHours`, {
      writable: true,
      value: Date.prototype.getHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCHours`, {
      writable: true,
      value: Date.prototype.getUTCHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMinutes`, {
      writable: true,
      value: Date.prototype.getMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMinutes`, {
      writable: true,
      value: Date.prototype.getUTCMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getSeconds`, {
      writable: true,
      value: Date.prototype.getSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCSeconds`, {
      writable: true,
      value: Date.prototype.getUTCSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMilliseconds`, {
      writable: true,
      value: Date.prototype.getMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMilliseconds`, {
      writable: true,
      value: Date.prototype.getUTCMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getTimezoneOffset`, {
      writable: true,
      value: Date.prototype.getTimezoneOffset,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setTime`, {
      writable: true,
      value: Date.prototype.setTime,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMilliseconds`, {
      writable: true,
      value: Date.prototype.setMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMilliseconds`, {
      writable: true,
      value: Date.prototype.setUTCMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setSeconds`, {
      writable: true,
      value: Date.prototype.setSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCSeconds`, {
      writable: true,
      value: Date.prototype.setUTCSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMinutes`, {
      writable: true,
      value: Date.prototype.setMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMinutes`, {
      writable: true,
      value: Date.prototype.setUTCMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setHours`, {
      writable: true,
      value: Date.prototype.setHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCHours`, {
      writable: true,
      value: Date.prototype.setUTCHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setDate`, {
      writable: true,
      value: Date.prototype.setDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCDate`, {
      writable: true,
      value: Date.prototype.setUTCDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMonth`, {
      writable: true,
      value: Date.prototype.setMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMonth`, {
      writable: true,
      value: Date.prototype.setUTCMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setFullYear`, {
      writable: true,
      value: Date.prototype.setFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCFullYear`, {
      writable: true,
      value: Date.prototype.setUTCFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toUTCString`, {
      writable: true,
      value: Date.prototype.toUTCString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toISOString`, {
      writable: true,
      value: Date.prototype.toISOString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toJSON`, {
      writable: true,
      value: Date.prototype.toJSON,
    });
  }

  function sjsInitRegExp() {
    Object.defineProperty(RegExp.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'RegExp',
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}exec`, {
      writable: true,
      value: RegExp.prototype.exec,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}test`, {
      writable: true,
      value: RegExp.prototype.test,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}toString`, {
      writable: true,
      value: RegExp.prototype.toString,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}source`, {
      get: function get() {
        return this.source;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}global`, {
      get: function get() {
        return this.global;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}ignoreCase`, {
      get: function get() {
        return this.ignoreCase;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}multiline`, {
      get: function get() {
        return this.multiline;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}lastIndex`, {
      get: function get() {
        return this.lastIndex;
      },
      set: function set(v) {
        this.lastIndex = v;
      },
    });
  }

  function is(target, type) {
    return Object.prototype.toString.call(target) === `[object ${type}]`;
  }

  // 所有`$sjs_`开头的变量需要作为自定义脚本的全局变量
  function sjsInitGlobals() {
    const sjsConsole = {};
    sjsConsole[`${PREFIX}log`] = function () {
      let res = 'SJS: ';
      for (let i = 0; i < arguments.length; ++i) {
        res += `${arguments[i]} `;
      }
      if (g.MP && g.MP.workerConsole) {
        g.MP.workerConsole.log(res);
      } else {
        // do not console log on worker
        // console.log(res);
      }
    };

    function converter(obj, prefix) {
      if (obj === null || obj === undefined) return obj;
      if (is(obj, 'String') || is(obj, 'Boolean') || is(obj, 'Number')) {
        return obj;
      }
      if (is(obj, 'Object')) {
        const copy = {};
        // eslint-disable-next-line
        for (var k in obj) {
          // eslint-disable-next-line no-prototype-builtins
          if (obj.hasOwnProperty(k)) {
            if (undefined === prefix) {
              copy[k.substring(PREFIX_LENGTH)] = converter(obj[k], prefix);
            } else {
              copy[prefix + k] = converter(obj[k], prefix);
            }
          }
        }
        return copy;
      }
      if (Array.isArray(obj)) {
        const _copy = [];
        for (let i = 0; i < obj.length; i++) {
          _copy.push(converter(obj[i], prefix));
        }
        return _copy;
      }
      if (is(obj, 'Date')) {
        const _copy2 = new Date();
        _copy2.setTime(obj.getTime());
        return _copy2;
      }
      if (is(obj, 'RegExp')) {
        let f = '';
        if (obj.global) f += 'g';
        if (obj.ignoreCase) f += 'i';
        if (obj.multiline) f += 'm';
        return new RegExp(obj.source, f);
      }
      if (is(obj, 'Function')) {
        return undefined;
      }
      return null;
    }

    const sjsJSON = {};
    sjsJSON[`${PREFIX}stringify`] = function (o) {
      JSON.stringify(o);
      return JSON.stringify(converter(o));
    };
    sjsJSON[`${PREFIX}parse`] = function (o) {
      if (o === undefined) {
        return undefined;
      }
      const t = JSON.parse(o);
      return converter(t, PREFIX);
    };

    const sjsObject = {};
    sjsObject[`${PREFIX}keys`] = function (o) {
      const keys = Object.keys(o);
      const ret = [];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].substring(0, PREFIX_LENGTH) === PREFIX) {
          ret.push([keys[i].substring(PREFIX_LENGTH)]);
        }
      }
      return ret;
    };

    g[`${PREFIX}getDate`] = function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(Date);
      return new (Function.prototype.bind.apply(Date, args))();
    };
    g[`${PREFIX}getRegExp`] = function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(RegExp);
      return new (Function.prototype.bind.apply(RegExp, args))();
    };
    g[`${PREFIX}parseInt`] = parseInt;
    g[`${PREFIX}parseFloat`] = parseFloat;
    g[`${PREFIX}isNaN`] = isNaN;
    g[`${PREFIX}isFinite`] = isFinite;
    g[`${PREFIX}decodeURI`] = decodeURI;
    g[`${PREFIX}decodeURIComponent`] = decodeURIComponent;
    g[`${PREFIX}encodeURI`] = encodeURI;
    g[`${PREFIX}encodeURIComponent`] = encodeURIComponent;
    g[`${PREFIX}console`] = sjsConsole;
    g[`${PREFIX}JSON`] = sjsJSON;
    g[`${PREFIX}Object`] = sjsObject;
    g[`_${PREFIX}p`] = function ($t) {
      return $t == null
        ? undefined
        : $t[`${PREFIX}constructor`] === 'Number'
          ? $t
          : PREFIX + $t;
    };
  }

  // 在sjsInit中初始化对native的更改
  function sjsInit() {
    sjsInitObject();
    sjsInitFunction();
    sjsInitArray();
    sjsInitString();
    sjsInitBoolean();
    sjsInitNumber();
    sjsInitMath();
    sjsInitDate();
    sjsInitRegExp();
    sjsInitGlobals();
  }

  if (!g.__sjsEnvInited) {
    g.__sjsEnvInited = 1;
    sjsInit();
  }
})(typeof global !== 'undefined' ? global : self);
