import { isFunction, extend, clone } from '@/nerv/utils';
import {
  Props,
  ComponentLifecycle,
  Refs,
  EMPTY_OBJ,
  Component as ComponentInst,
  CompositeComponent,
  EMPTY_CHILDREN,
} from '@/nerv/shared';
import { enqueueRender } from './render-queue';
import { updateComponent } from './lifecycle';
import { Hook, HookEffect } from './hooks';

interface Component<P = {}, S = {}> extends ComponentLifecycle<P, S> {
  _rendered: any;
  dom: any;
}

class Component<P, S> implements ComponentInst<P, S> {
  public static defaultProps: {}

  static getDerivedStateFromError? (error?): object | null

  state: Readonly<S>

  props: Readonly<P> & Readonly<Props>

  prevProps: P

  prevState: S

  prevContext: object

  _parentComponent: Component<any, any>

  vnode: CompositeComponent

  context: any

  _dirty = true

  _disable = true

  _pendingStates: any[] = []

  _pendingCallbacks: Function[] = []

  refs: Refs

  isReactComponent: Record<string, any>

  _afterScheduleEffect = false

  hooks: Hook[] = []

  effects: HookEffect[] = EMPTY_CHILDREN

  layoutEffects: HookEffect[] = EMPTY_CHILDREN

  constructor(props?: P, context?: any) {
    if (!this.state) {
      this.state = {} as S;
    }
    this.props = props || ({} as P);
    this.context = context || EMPTY_OBJ;
    this.refs = {};
  }

  setState<K extends keyof S>(
    state:
      | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S)
      | (Pick<S, K> | S),
    callback?: () => void,
  ): void {
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

    return stateClone as S;
  }

  clearCallBacks() {
    // cached the length of callbacks, or callbacks may increase by calling them in the same loop
    let len = this._pendingCallbacks.length;
    while (this._dirty ? this._pendingCallbacks.length : len) {
      const cb = this._pendingCallbacks.shift()!;
      cb.call(this);
      len--;
    }
  }

  forceUpdate(callback?: Function) {
    if (isFunction(callback)) {
      this._pendingCallbacks.push(callback);
    }
    updateComponent(this, true);
  }

  // tslint:disable-next-line
  public render(nextProps?: P, nextState?, nextContext?): any {}
}

Component.prototype.isReactComponent = EMPTY_OBJ;

export default Component;
