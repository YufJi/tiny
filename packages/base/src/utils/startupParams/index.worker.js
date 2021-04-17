
import { parse } from 'query-string';
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
  // if (Platform.browser === 'android' && !Platform.ide) {
  //   console.error('framework: can not call getStartupParams() at the top of code!');
  // }

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
