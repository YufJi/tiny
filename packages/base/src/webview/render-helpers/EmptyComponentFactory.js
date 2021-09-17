const caches = {};

export default function EmptyComponentFactory(type) {
  if (caches[type]) {
    return caches[type];
  }

  function EmptyComponent(props) {
    const { children = null } = props;

    return children;
  }

  EmptyComponent.displayName = type;
  caches[type] = EmptyComponent;
  return EmptyComponent;
}
