import objectKeys from './objectKeys';

export default function escapeLogParams(params) {
  if (!params) {
    return '';
  }
  if (typeof params === 'string') {
    return params;
  }
  return objectKeys(params).map((key) => {
    let escaped = `${key}=`;
    escaped += String(params[key]).replace(/,/g, ';').replace(/\^/g, '@').replace(/\=/g, '~');
    return escaped;
  }).join('^');
}
