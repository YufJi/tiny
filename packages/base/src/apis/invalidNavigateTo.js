
import { getCurrentPagesImpl } from '@/core/framework/App';

export default function invalidNavigateTo(params = {}) {
  const { mpRuntimeConfig } = self;

  const limit = mpRuntimeConfig && mpRuntimeConfig.navigationStackLimits || 10;
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
