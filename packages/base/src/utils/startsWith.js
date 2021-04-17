
export default function startsWith(str, prefix) {
  if (!str || !prefix) {
    return false;
  }
  return str.slice(0, prefix.length) === prefix;
}
