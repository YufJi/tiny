export function debug(...args) {
  console.log('[framework]', ...args);
}

export function error(...args) {
  console.error('[framework]', ...args);
}

export function warn(...args) {
  console.warn('[framework]', ...args);
}
