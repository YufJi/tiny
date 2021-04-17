
function getFastKey(key) {
  if (key == null) {
    return `^${String(key)}`;
  } else if (typeof key === 'string') {
    return `$${key}`;
  } else if (typeof key === 'number') {
    return `n${key}`;
  } else if (typeof key === 'boolean') {
    return `b${key}`;
  }
  return null;
}
function Map() {
  this.clear();
}

Map.prototype = {
  constructor: Map,
  _getEntry: function _getEntry(key) {
    const entries = this._entries;
    for (let i = 0, l = entries.length; i < l; i++) {
      if (entries[i][0] === key) {
        return {
          index: i,
          value: entries[i],
        };
      }
    }
    return undefined;
  },
  get: function get(key) {
    const fastKey = getFastKey(key);
    if (fastKey !== null) {
      return this._store[fastKey];
    }
    const entry = this._getEntry(key);
    return entry && entry.value[1];
  },
  entries: function entries() {
    const _this = this;

    const entries = [];
    Object.keys(this._store).forEach((k) => {
      entries.push([k, _this._store[k]]);
    });
    return entries.concat(this._entries);
  },
  forEach: function forEach(callback, thisArg) {
    const  _this = this;

    this.entries().forEach((item) => {
      callback.call(thisArg, item[1], item[0],  _this);
    });
  },
  set: function set(key, value) {
    const fastKey = getFastKey(key);
    if (fastKey !== null) {
      this._store[fastKey] = value;
      return;
    }
    const entry = this._getEntry(key);
    if (entry) {
      entry.value[1] = value;
      return;
    }
    this._entries.push([key, value]);
  },
  delete: function _delete(key) {
    const fastKey = getFastKey(key);
    if (fastKey !== null) {
      delete this._store[fastKey];
      return;
    }
    const entry = this._getEntry(key);
    if (entry) {
      this._entries.splice(entry.index, 1);
    }
  },
  clear: function clear() {
    this._store = {};
    this._entries = [];
  },
};

export default Map;
