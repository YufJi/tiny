/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:55:05
 * @LastEditTime: 2021-07-13 11:55:48
 * @Description:
 * @FilePath: /yeact/src/memo.js
 */
import { shallowEqual, isFunction } from './utils';
import Ref from './vdom/ref';
import createElement from './create-element';

export function memo(component, propsAreEqual) {
  function shouldComponentUpdate(nextProps) {
    const prevRef = this.props.ref;
    const nextRef = nextProps.ref;
    if (prevRef !== nextRef) {
      Ref.detach(this.vnode, prevRef, this.dom);
      Ref.attach(this.vnode, nextRef, this.dom);
      return true;
    }
    return isFunction(propsAreEqual) ? !propsAreEqual(this.props, nextProps) : !shallowEqual(this.props, nextProps);
  }

  function Memoed(props) {
    this.shouldComponentUpdate = shouldComponentUpdate;
    return createElement(component, { ...props });
  }

  Memoed._forwarded = true;

  Memoed.isMemo = true;

  return Memoed;
}
