import requireFile from '@/utils/requireFile';
import qs from 'qs';

export default function getLaunchOptionsSync(params) {
  const { path, ...query } = qs.parse(window.location.search.replace('?', ''));
  const { pages } = requireFile('/biz/appConfig.json');

  return {
    query,
    path: path || pages[0],
  };
}
