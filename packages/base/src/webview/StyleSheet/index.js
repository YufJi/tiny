function StyleSheet() {
  this.deps = [];
  this.style = '';
}

StyleSheet.prototype = {
  imports: function imports(...deps) {
    mergeArray(this.deps, deps);
    return this;
  },
  exports: function exports(style) {
    this.style = style;
    return this;
  },
  toObjects: function toObjects() {
    if (this.objectArray) {
      return this.objectArray;
    }
    // incase recrursive
    this.objectArray = [];
    const all = [];
    this.deps.forEach((d) => {
      const ds = d.toObjects();
      mergeArray(all, ds);
    });
    all.push(this);
    this.objectArray = all;
    return all;
  },
  toString: function toString() {
    if (this.valueString) {
      return this.valueString;
    }
    this.valueString = this.toObjects().map((o) => {
      return o.style;
    }).join('\n');
    return this.valueString;
  },
};

function mergeArray(target, from) {
  from.forEach((f) => {
    if (target.indexOf(f) === -1) {
      target.push(f);
    }
  });
  return target;
}

export default StyleSheet;
