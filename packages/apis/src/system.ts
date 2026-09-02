import { callSync } from '@tiny/bridge';

export type AppLaunchOptions = {
  path: string;
  query: Record<string, any>;
}

export function getLaunchOptionsSync() {
  const result = callSync<AppLaunchOptions>('getLaunchOptionsSync');
  return result;
}