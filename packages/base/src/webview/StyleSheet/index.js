function mergeArray(target, from) {
  from.forEach((f) => {
    if (target.indexOf(f) === -1) {
      target.push(f);
    }
  });

  return target;
}

export default class StyleSheet {
  constructor() {
    this.deps = [];
    this.style = '';
  }

  imports(...deps) {
    mergeArray(this.deps, deps);
    return this;
  }

  exports(style) {
    this.style = style;
    return this;
  }

  toObjects() {
    if (this.objectArray) {
      return this.objectArray;
    }

    this.objectArray = [];

    this.objectArray.push(this);

    this.deps.forEach((dep) => {
      const ds = dep.toObjects();
      mergeArray(this.objectArray, ds);
    });

    return this.objectArray;
  }

  toString() {
    if (this.valueString) {
      return this.valueString;
    }

    this.valueString = this.toObjects().map((o) => {
      return o.style;
    }).join('\n');

    return this.valueString;
  }
}
