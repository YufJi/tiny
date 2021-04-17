
import getData from '@/core/utils/getData';
import objectKeys from './objectKeys';

export default function(data, dataConfig) {
  if (!data) {
    return undefined;
  }
  const ret = {};
  objectKeys(dataConfig).forEach((k) => {
    ret[k] = getData(data, dataConfig[k]);
  });
  return ret;
}
