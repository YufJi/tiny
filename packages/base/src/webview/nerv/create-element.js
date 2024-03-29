import { isFunction, isString, isUndefined } from './utils';
import Current from './current-owner';
import FullComponent from './full-component';
import h from './vdom/h';

export default function createElement(type, properties, ..._children) {
  let children = _children;

  if (_children && _children.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    children = _children[0];
  }

  let props;

  if (isString(type)) {
    props = transformPropsForRealTag(properties);
    props.owner = Current.current;

    return h(type, props, children);
  } else if (isFunction(type)) {
    props = transformPropsForComponent(properties, type.defaultProps);
    props.children = children;
    props.owner = Current.current;

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
    } else {
      newProps[propName] = propValue;
    }
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
