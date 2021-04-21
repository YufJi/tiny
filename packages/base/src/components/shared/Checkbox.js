import React from 'react';
import classnames from 'classnames';
import Icon from './Icon';

export default class Checkbox extends React.PureComponent {
  render() {
    const { id, prefixCls, className = '', style, type = 'checkbox', disabled, checked, onChange, color } = this.props;

    const wrapCls = classnames({
      'a-shared-checkbox': true,
      'a-shared-checkbox-disabled': disabled,
      [className]: true,
      [`${prefixCls}-checked`]: checked,
      [`${prefixCls}-disabled`]: disabled,
    });
    const colorProp = disabled ? { color: '#adadad' } : color ? { color } : {};

    return (
      <span className={wrapCls} style={style} id={id}>
        <input type={type} disabled={disabled} className={`${prefixCls}-input`} checked={!!checked} onChange={onChange} />
        {checked ? <Icon type={type === 'radio' ? 'success' : 'success_no_circle'} size={type === 'radio' ? 22 : 16} {...colorProp} /> : null}
      </span>
    );
  }
}
