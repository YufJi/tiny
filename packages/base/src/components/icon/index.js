
import React from 'react';
import { createComponent } from '@/framework/';
import Loading from '../shared/Loading';
import Icon from '../shared/Icon';

export default createComponent({
  name: 'icon',
})((props) => {
  const { $mp, className, style, id, type, mode, ...otherProps } = props;

  return React.createElement(
    'span',
    { className, ...$mp && $mp.getAriaProps(), style: { ...style }, id },
    type === 'loading' ? React.createElement(Loading, { mode }) : React.createElement(Icon, { type, ...otherProps }),
  );
});
