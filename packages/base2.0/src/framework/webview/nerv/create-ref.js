/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:56:24
 * @LastEditTime: 2021-07-12 20:56:43
 * @Description:
 * @FilePath: /yeact/src/create-ref.js
 */

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
