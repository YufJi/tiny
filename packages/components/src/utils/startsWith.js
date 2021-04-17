
export default function startsWith(str, prefix) {
  return str && str.slice(0, prefix.length) === prefix;
}
