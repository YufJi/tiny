let uid = 0;

export function createGuid(type) {
  return `${type}-${uid+=1}`;
}
