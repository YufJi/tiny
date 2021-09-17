import { isNil } from './shared';
import { isFunction, isUndefined, nextTick, isArray, objectIs, throwError } from './utils';
import Current from './current-owner';
import { enqueueRender } from './render-queue';

export function getHooks(index) {
  if (Current.current === null) {
    throwError('invalid hooks call: hooks can only be called in a stateless component.');
  }

  const { hooks } = Current.current;
  if (index >= hooks.length) {
    hooks.push({});
  }
  return hooks[index];
}

export function useState(initialState) {
  if (isFunction(initialState)) {
    initialState = initialState();
  }

  const hook = getHooks(Current.index++);
  if (!hook.state) {
    hook.component = Current.current;
    hook.state = [
      initialState,
      (action) => {
        hook.state[0] = isFunction(action) ? action(hook.state[0]) : action;
        hook.component._disable = false;
        hook.component.setState({});
      },
    ];
  }
  return hook.state;
}

export function useReducer(
  reducer,
  initialState,
  initializer,
) {
  if (isFunction(initialState)) {
    initialState = initialState();
  }
  const hook = getHooks(Current.index++);
  if (!hook.state) {
    hook.component = Current.current;
    hook.state = [
      isUndefined(initializer) ? initialState : initializer(initialState),
      (action) => {
        hook.state[0] = reducer(hook.state[0], action);
        hook.component._disable = false;
        hook.component.setState({});
      },
    ];
  }
  return hook.state;
}

function areDepsChanged(prevDeps, deps) {
  if (isNil(prevDeps) || isNil(deps)) {
    return true;
  }
  return deps.some((d, i) => !objectIs(d, prevDeps[i]));
}

export function invokeEffects(component, key) {
  const effects = component[key] || [];
  effects.forEach((hook) => {
    if (isFunction(hook.cleanup)) {
      hook.cleanup();
    }
    const result = hook.effect();
    if (isFunction(result)) {
      hook.cleanup = result;
    }
  });

  component[key] = [];
}

let scheduleEffectComponents = [];

function invokeScheduleEffects(component) {
  if (!component._afterScheduleEffect) {
    component._afterScheduleEffect = true;
    scheduleEffectComponents.push(component);

    if (scheduleEffectComponents.length === 1) {
      nextTick(() => {
        scheduleEffectComponents.forEach((c) => {
          c._afterScheduleEffect = false;
          invokeEffects(c, 'effects');
        });
        scheduleEffectComponents = [];
        // setTimeout(() => {
        //   scheduleEffectComponents.forEach((c) => {
        //     c._afterScheduleEffect = false;
        //     invokeEffects(c, 'effects');
        //   });
        //   scheduleEffectComponents = [];
        // }, 0);
      });
    }
  }
}

function useEffectImpl(effect, key, deps) {
  const hook = getHooks(Current.index++);
  if (areDepsChanged(hook.deps, deps)) {
    hook.effect = effect;
    hook.deps = deps;

    Current.current[key] = Current.current[key].concat(hook);

    if (key === 'effects') {
      invokeScheduleEffects(Current.current);
    }
  }
}

export function useEffect(effect, deps) {
  useEffectImpl(effect, 'effects', deps);
}

export function useLayoutEffect(effect, deps) {
  useEffectImpl(effect, 'layoutEffects', deps);
}

export function useDangerousReverseLayoutEffect(effect, deps) {
  useEffectImpl(effect, 'reversedLayoutEffects', deps);
}

export function useRef(initialValue) {
  const hook = getHooks(Current.index++);
  if (!hook.ref) {
    hook.ref = {
      current: initialValue,
    };
  }
  return hook.ref;
}

export function useMemo(factory, deps) {
  const hook = getHooks(Current.index++);
  if (areDepsChanged(hook.deps, deps)) {
    hook.deps = deps;
    hook.callback = factory;
    hook.value = factory();
  }
  return hook.value;
}

export function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

export function useContext(context) {
  const provider = Current.current.context[context._id];
  if (isUndefined(provider)) {
    return context._defaultValue;
  }
  const hook = getHooks(Current.index++);
  // should update when value changes with shouldComponentUpdate:false Component on top
  if (isUndefined(hook.context)) {
    hook.context = true;
    const c = Current.current;
    provider.on(() => enqueueRender(c));
  }
  return provider.value;
}

export function useImperativeHandle(
  ref,
  init,
  deps,
) {
  useLayoutEffect(() => {
    if (isFunction(ref)) {
      ref(init());
      return () => ref(null);
    } else if (!isUndefined(ref)) {
      ref.current = init();
      return () => {
        delete ref.current;
      };
    }
  }, isArray(deps) ? deps.concat([ref]) : undefined);
}
