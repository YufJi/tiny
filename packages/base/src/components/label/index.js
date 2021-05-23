import Nerv, { createNervClass } from '@/nerv';
import { createComponent } from '@/framework/';

export default createComponent({
  pure: false,
  name: 'label',
})(createNervClass({
  onClick() {
    const forProp = this.props.for;

    if (forProp) {
      const input = document.querySelector(`#${forProp} input,#${forProp} textarea`);
      if (input) {
        input.click();
        input.focus();
      }
    }
  },
  render() {
    const { $mp, ...rest } = this.props;
    return Nerv.createElement('label', { ...rest, onClick: this.onClick });
  },
}));
