
import React from 'react';
import classnames from 'classnames';
import Touchable from 'rc-touchable';
import Loading from './Loading';

const prefixCls = 'a-button';

class Button extends React.PureComponent {
  render() {
    const { children, className, type, size, disabled, loading, activeClassName, activeStopPropagation, onClick, delayPressIn, delayPressOut, ...restProps } = this.props;
    const wrapCls = classnames({
      [className]: true,
      [`${prefixCls}-primary`]: type === 'primary',
      [`${prefixCls}-ghost`]: type === 'ghost',
      [`${prefixCls}-warn`]: type === 'warn',
      [`${prefixCls}-small`]: size === 'mini',
      [`${prefixCls}-disabled`]: disabled,
    });
    const clickable = {
      'data-clickable': true,
    };
    const delayProps = {};
    if (delayPressIn) {
      delayProps.delayPressIn = delayPressIn;
    }
    if (delayPressOut) {
      delayProps.delayPressOut = delayPressOut;
    }
    // use div, button native is buggy @yiminghe
    return React.createElement(
      Touchable,
      { activeClassName, activeStopPropagation, disabled, ...delayProps },
      React.createElement(
        'a',
        { role: 'button', className: wrapCls, ...restProps, ...clickable, onClick: disabled ? undefined : onClick, 'aria-disabled': disabled },
        loading ? React.createElement(Loading, { mode: type === 'primary' ? 'white' : '' }) : null,
        children,
      ),
    );
  }
}

export default Button;