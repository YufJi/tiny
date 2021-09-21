import { EMPTY_OBJ, EMPTY_CHILDREN } from './shared';
import { isFunction, extend, clone } from './utils';
import { enqueueRender } from './render-queue';
// eslint-disable-next-line import/no-cycle
import { updateComponent } from './lifecycle';

class Component {
  constructor(props, context) {
    this._dirty = true;
    this._disable = true;
    this._pendingStates = [];
    this._pendingCallbacks = [];
    this._afterScheduleEffect = false;
    this.hooks = [];
    this.effects = EMPTY_CHILDREN;
    this.layoutEffects = EMPTY_CHILDREN;
    this.reversedLayoutEffects = EMPTY_CHILDREN;

    if (!this.state) {
      this.state = {};
    }

    this.props = props || {};
    this.context = context || EMPTY_OBJ;
    this.refs = {};
  }

  setState(state, callback) {
    if (state) {
      this._pendingStates.push(state);
    }
    if (isFunction(callback)) {
      this._pendingCallbacks.push(callback);
    }
    if (!this._disable) {
      enqueueRender(this);
    }
  }

  getState() {
    // tslint:disable-next-line:no-this-assignment
    const { _pendingStates, state, props } = this;
    if (!_pendingStates.length) {
      return state;
    }
    const stateClone = clone(state);
    const queue = _pendingStates.concat();
    this._pendingStates.length = 0;
    queue.forEach((nextState) => {
      if (isFunction(nextState)) {
        nextState = nextState.call(this, state, props);
      }
      extend(stateClone, nextState);
    });

    return stateClone;
  }

  clearCallBacks() {
    // cached the length of callbacks, or callbacks may increase by calling them in the same loop
    let len = this._pendingCallbacks.length;
    while (this._dirty ? this._pendingCallbacks.length : len) {
      const cb = this._pendingCallbacks.shift();
      cb.call(this);
      len--;
    }
  }

  forceUpdate(callback) {
    if (isFunction(callback)) {
      this._pendingCallbacks.push(callback);
    }
    updateComponent(this, true);
  }
}

Component.prototype.isReactComponent = EMPTY_OBJ;

export default Component;
