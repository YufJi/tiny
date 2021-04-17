
let no = 0;

export function createGuid(type) {
  return type + '_' + no++;
}
