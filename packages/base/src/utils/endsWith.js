export default function endsWith(str, suffix) {
  return str && str.slice(0 - suffix.length) === suffix;
}
