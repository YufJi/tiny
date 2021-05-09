const Ref = {
  getInitialState() {
    this.refHandlers = {};
    this.refComponents = {};
    return {};
  },
  $getRefHandler(name) {
    const _this = this;

    if (this.refHandlers[name]) {
      return this.refHandlers[name];
    }
    this.refHandlers[name] = function (ref) {
      let c = ref;
      if (c && c.getWrappedComponent) {
        c = c.getWrappedComponent();
      }
      _this.refComponents[name] = c;
    };

    return this.refHandlers[name];
  },
};

export default Ref;
