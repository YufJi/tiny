export * from './wrap';
export * from './log';

/** guid */
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = 16 * Math.random() | 0;
    return (char === 'x' ? rand : 3 & rand | 8).toString(16);
  });
}
