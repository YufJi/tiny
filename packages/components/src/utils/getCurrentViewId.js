
import { getCurrentPageImpl } from '../framework/dev';

export default function getCurrentViewId() {
  const page = getCurrentPageImpl();
  return page && page.getViewId();
}
