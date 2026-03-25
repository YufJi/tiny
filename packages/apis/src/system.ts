import { callSync } from '@tiny/bridge';
import { createLogger } from '@tiny/utils';

const logger = createLogger('apis-system');

export type AppLaunchOptions = {
  path: string;
  query: Record<string, any>;
}

export function getLaunchOptionsSync() {
  const result = callSync<AppLaunchOptions>('getLaunchOptionsSync');
  logger.log('getLaunchOptionsSync:', result);
  return result;
}