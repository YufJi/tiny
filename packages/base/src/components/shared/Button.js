import Nerv from '@/nerv';
import classnames from 'classnames';
import Loading from './Loading';

const prefixCls = 'a-button';

class Button extends Nerv.PureComponent {
  render() {
    const { children, className, type, size, disabled, loading, activeClassName, activeStopPropagation, onClick, delayPressIn, delayPressOut, $mp, ...restProps } = this.props;
    const wrapCls = classnames({
      [className]: true,
      [`${prefixCls}-primary`]: type === 'primary',
      [`${prefixCls}-ghost`]: type === 'ghost',
      [`${prefixCls}-warn`]: type === 'warn',
      [`${prefixCls}-small`]: size === 'mini',
      [`${prefixCls}-disabled`]: disabled,
    });

    const delayProps = {};
    if (delayPressIn) {
      delayProps.delayPressIn = delayPressIn;
    }
    if (delayPressOut) {
      delayProps.delayPressOut = delayPressOut;
    }
    // use div, button native is buggy @yiminghe
    return Nerv.createElement(
      'a',
      { role: 'button',
        className: wrapCls,
        ...restProps,
        onClick: disabled ? undefined : onClick,
        'aria-disabled': disabled },
      loading ? Nerv.createElement(Loading, { mode: type === 'primary' ? 'white' : '' }) : null,
      children,
    );
  }
}

export default Button;
