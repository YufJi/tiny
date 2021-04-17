
if (!global.Symbol) {
  let id = 0;
  const _Symbol = function Symbol(key) {
    return `$$_mp_symbol_${key}_${++id}_$$`;
  };
  _Symbol.iterator = _Symbol('Symbol.iterator');
  global.Symbol = _Symbol;
}
