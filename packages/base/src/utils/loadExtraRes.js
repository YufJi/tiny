
import endsWith from './endsWith';
import ap from '@/apis/ap';

export default function (extraAppId) {
  let Loaded = false;
  const res = ap.callInternalAPISync('addPkgRes', {
    resAppId: extraAppId,
  });
  res && res.urls && res.urls.forEach((item) => {
    if (!Loaded && endsWith(item, 'index.worker.js')) {
      importScripts(item);
      Loaded = true;
    }
  });
}
