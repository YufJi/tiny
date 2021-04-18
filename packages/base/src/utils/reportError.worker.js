
import { getCurrentPageImpl } from '@/framework/App';

export default function reportError(code, e, count = 0) {
  if (count === 10) {
    return;
  }
  const page = getCurrentPageImpl();
  if (page) {
    page.callRemote('bridge', 'reportError', code, e);
  } else {
    setTimeout(() => {
      reportError(code, e, count + 1);
    }, 100);
  }
}
