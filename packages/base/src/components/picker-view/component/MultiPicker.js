import React from 'react';

export default class MultiPicker extends React.Component {
  getValue = () => {
    const { children, selectedValue } = this.props;

    if (selectedValue && selectedValue.length) {
      return selectedValue;
    } else {
      if (!children) {
        return [];
      }
      return React.Children.map(children, (c) => {
        const cc = React.Children.toArray(c.props.children);
        return cc && cc[0] && cc[0].props.value;
      });
    }
  }

  onValueChange = (i, v) => {
    const value = this.getValue().concat();
    value[i] = v;
    const { onValueChange } = this.props;

    if (onValueChange) {
      onValueChange(value, i);
    }
  }

  render() {
    const _this = this;

    const { className = '', rootNativeProps, children, style, id } = this.props;

    const selectedValue = this.getValue();
    const colElements = React.Children.map(children, (col, i) => {
      return React.cloneElement(col, {
        selectedValue: selectedValue[i],
        onValueChange(...args) {
          return _this.onValueChange.apply(_this, [i].concat(args));
        },
      });
    });
    return React.createElement(
      'div',
      { ...rootNativeProps, style, className: `${className}`, id },
      colElements,
    );
  }
}
