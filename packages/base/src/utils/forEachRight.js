export default function forEachRight(list = [], cb) {
  const len = list.length;
  for (let index = len - 1; index > -1; index--) {
    const item = list[index];
    cb(item);
  }
}
