/*
 * @Author: YufJ
 * @Date: 2021-07-12 11:36:57
 * @LastEditTime: 2021-07-13 15:41:52
 * @Description:
 * @FilePath: /yeact/src/create-element.js
 */
import { EMPTY_CHILDREN } from './shared';
import { isFunction, isString, isUndefined } from './utils';
import CurrentOwner from './current-owner';
import FullComponent from './full-component';
import h from './vdom/h';

export default function createElement(type, properties, ..._children) {
  let children = _children;

  if (_children && _children.length === 1) {
    children = _children[0];
  }

  let props;

  if (isString(type)) {
    props = transformPropsForRealTag(properties);
    props.owner = CurrentOwner.current;

    return h(type, props, children);
  } else if (isFunction(type)) {
    props = transformPropsForComponent(properties, type.defaultProps);
    // props.children = children;
    if (!props.children || props.children === EMPTY_CHILDREN) {
      props.children = children || children === 0 ? children : EMPTY_CHILDREN;
    }
    props.owner = CurrentOwner.current;

    return new FullComponent(type, props);
  }

  return type;
}

function transformPropsForRealTag(props) {
  const newProps = {};
  for (const propName in props) {
    const propValue = props[propName];
    if (propName === 'defaultValue') {
      newProps.value = props.value || props.defaultValue;
      continue;
    }

    newProps[propName] = propValue;
  }
  return newProps;
}

function transformPropsForComponent(props, defaultProps) {
  const newProps = {};
  for (const propName in props) {
    const propValue = props[propName];
    newProps[propName] = propValue;
  }

  if (defaultProps) {
    for (const propName in defaultProps) {
      if (isUndefined(newProps[propName])) {
        newProps[propName] = defaultProps[propName];
      }
    }
  }

  return newProps;
}
