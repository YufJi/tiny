
export default function camelCase(name) {
  return name.replace(/-(\w)/g, (_w, g) => {
    return g.toUpperCase();
  });
}
