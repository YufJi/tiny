import Nerv from '@/nerv';
import { createComponent } from '@/framework/';
import Loading from '../shared/Loading';
import Icon from '../shared/Icon';

export default createComponent({
  name: 'icon',
})((props) => {
  const { $mp, className, style, id, type, mode, ...otherProps } = props;

  return Nerv.createElement(
    'span',
    { className, ...$mp && $mp.getAriaProps(), style: { ...style }, id },
    type === 'loading' ? Nerv.createElement(Loading, { mode }) : Nerv.createElement(Icon, { type, ...otherProps }),
  );
});
