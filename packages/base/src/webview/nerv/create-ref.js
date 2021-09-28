export function createRef() {
  return {};
}

export function forwardRef(cb) {
  const fn = (props) => {
    const { ref } = props;
    delete props.ref;
    return cb(props, ref);
  };
  fn._forwarded = true;
  return fn;
}
