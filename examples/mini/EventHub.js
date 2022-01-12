class EventEmitter {
  constructor() {
    this.allListeners = {};
  }

  _addListener(_types, listener, options = {}) {
    const _this = this;

    let types = _types;
    if (!Array.isArray(types)) {
      types = [types];
    }
    const { allListeners } = this;

    types.forEach((type) => {
      const fns = allListeners[type] = allListeners[type] || [];
      if (fns.indexOf(listener) !== -1) {
        return;
      }
      if (options.prepend) {
        fns.unshift(listener);
      } else {
        fns.push(listener);
      }
    });
    return {
      remove: function remove() {
        _this.removeListener(types, listener);
      },
    };
  }

  addListener(types, listener) {
    return this._addListener(types, listener);
  }

  prependListener(types, listener) {
    return this._addListener(types, listener, { prepend: true });
  }

  listeners(type) {
    return type ? this.allListeners[type] || [] : this.allListeners;
  }

  listenerCount(type) {
    if (type) {
      return this.listeners(type).length;
    } else {
      const { allListeners } = this;

      const keys = Object.keys(allListeners);
      let count = 0;
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        count += allListeners[key] && allListeners[key].length || 0;
      }
      return count;
    }
  }

  emit(_types, ...args) {
    let types = _types;
    if (!Array.isArray(types)) {
      types = [types];
    }
    const loopListeners = { ...this.allListeners };
    types.forEach((type) => {
      const fns = loopListeners[type];
      if (fns) {
        fns.concat().forEach((f) => {
          try {
            f.apply(undefined, args);
          } catch (e) {
            console.error(e);
          }
        });
      }
    });
  }

  removeListener(_types, listener) {
    let types = _types;
    if (!Array.isArray(types)) {
      types = [types];
    }
    const { allListeners } = this;

    types.forEach((type) => {
      const fns = allListeners[type];
      if (fns) {
        if (listener) {
          const index = fns.indexOf(listener);
          if (index !== -1) {
            fns.splice(index, 1);
          }
        } else {
          delete allListeners[type];
        }
      }
    });
  }

  on(...args) {
    this.addListener(...args);
  }

  off(...args) {
    this.removeListener(...args);
  }
}


export default new EventEmitter()