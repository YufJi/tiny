export function createLogger(namespace: string) {
  return {
    log: (...args: any[]) => {
      console.log(`[${namespace}]`, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[${namespace}]`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`[${namespace}]`, ...args);
    },
    debug: (...args: any[]) => {
      console.debug(`[${namespace}]`, ...args);
    },
  };
}
