import { parse } from 'qs';
import { getValue, setValue } from './startupParamsHolder';

const g = self;

export function setStartupParams(v) {
  g.__mpStartupParams = v;
  setValue(v);
}

export function getStartupParams() {
  if (g.__mpStartupParams) {
    return g.__mpStartupParams;
  }
  let startupParams = getValue();
  if (startupParams) {
    return startupParams;
  }

  const { href } = location;

  const queryIndex = href.indexOf('?');
  startupParams = {};
  if (queryIndex !== -1) {
    const queryString = href.slice(queryIndex + 1);
    startupParams = parse(queryString);
    setStartupParams(startupParams);
  }
  return startupParams;
}
