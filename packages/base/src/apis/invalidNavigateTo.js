import { getCurrentPagesImpl } from '@/framework/App';

export default function invalidNavigateTo(params = {}) {
  const { tinyRuntimeConfig } = self;

  const limit = tinyRuntimeConfig && tinyRuntimeConfig.navigationStackLimits || 10;
  if (getCurrentPagesImpl().length >= limit) {
    const { fail } = params;
    const { complete } = params;

    const error = {
      error: 1,
      errorMessage: `depth can not be more than ${limit}`,
    };
    if (fail) {
      fail(error);
    }
    if (complete) {
      complete(error);
    }
    return true;
  }
  return false;
}
