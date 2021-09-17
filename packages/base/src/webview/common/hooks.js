import { useRef, useContext, useEffect } from '../nerv';
import { FieldsContext, ConfigContext } from '../context';

export function useCreation(callback) {
  const ref = useRef({
    result: undefined,
    initialized: false,
  }).current;

  if (!ref.initialized) {
    ref.result = callback();
    ref.initialized = true;
  }

  return ref.result;
}

export function usePageFields() {
  const fields = useContext(FieldsContext);
  return fields;
}

export function useJSBridge() {
  return usePageFields().bridge;
}

export function useJSBridgeFn(callback) {
  const { bridge } = usePageFields();
  useCreation(() => {
    return callback(bridge);
  });
}

export function useConfigContext() {
  return useContext(ConfigContext);
}

export function usePrevious(o) {
  const ref = useRef();

  useEffect(() => {
    ref.current = o;
  }, [o]);

  return ref.current;
}
