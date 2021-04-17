
import { getCurrentPageImpl } from '@/core/framework/App';

export default function getCurrentViewId() {
  const page = getCurrentPageImpl();
  return page && page.getViewId();
}
