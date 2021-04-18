
import { getCurrentPageImpl } from '@/framework/App';

export default function getCurrentViewId() {
  const page = getCurrentPageImpl();
  return page && page.getViewId();
}
