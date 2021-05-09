export default function mergeArray(target, from) {
  from.forEach((f) => {
    if (target.indexOf(f) === -1) {
      target.push(f);
    }
  });
  return target;
}
