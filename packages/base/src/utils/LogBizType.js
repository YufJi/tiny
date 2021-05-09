import { getStartupParams } from '@/framework/startupParams';

export const TAC = 'TAC';

export function APP_BIZ() {
  return `TinyAppBiz-${getStartupParams().appId}`;
}
