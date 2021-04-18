
export default ({
  isValidAnimation: function isValidAnimation(anim) {
    const animation = anim || this.props.animation;
    return animation && animation.length;
  },
  componentDidMount: function componentDidMount() {
    this._animTimer = [];
    if (this.isValidAnimation()) {
      this.doAnimation();
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (this.props.animation !== prevProps.animation) {
      if (this.isValidAnimation(prevProps.animation)) {
        this.stopAnimation();
      }
      if (this.isValidAnimation()) {
        this.doAnimation();
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.deleteAllAnimTimers();
  },
  createAnimTimeout: function createAnimTimeout(fn, ms) {
    const _this = this;

    var timer = setTimeout(() => {
      _this.deleteAnimTimer(timer);
      fn();
    }, ms);
    this._animTimer.push(timer);
  },
  deleteAllAnimTimers: function deleteAllAnimTimers() {
    this._animTimer.forEach((t) => {
      clearTimeout(t);
    });
    this._animTimer = [];
  },
  deleteAnimTimer: function deleteAnimTimer(t) {
    const index = this._animTimer.indexOf(t);
    if (index !== -1) {
      clearTimeout(this._animTimer[index]);
      this._animTimer.splice(index, 1);
    }
  },
});
