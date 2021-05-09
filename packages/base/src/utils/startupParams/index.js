import { getValue, setValue } from './startupParamsHolder';

const g = self;

export function getStartupParams() {
  if (g.__mpStartupParams) {
    return g.__mpStartupParams;
  }
  return getValue() || {};
}

export const setStartupParams = setValue;
