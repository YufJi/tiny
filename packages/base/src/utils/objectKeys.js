
export default function objectKeys(obj) {
  if (obj && typeof obj === 'object') {
    return Object.keys(obj);
  }
  return [];
}
