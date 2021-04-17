
import objectKeys from '../utils/objectKeys';

export default function (api) {
  const newApi = {};
  objectKeys(api).forEach((key) => {
    newApi[key] = { ...api[key], ns: 'ap', topNS: true };
  });
  return newApi;
}
