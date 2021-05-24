import Nerv, { createNervClass } from '@/nerv';
import { createComponent } from '@/framework/';
import { getPropsEvent } from '@/utils/eventReg';

export default createComponent({
  pure: false,
  name: 'label',
})(createNervClass({
  onClick(e) {
    const forProp = this.props.for;

    if (forProp) {
      const input = document.querySelector(`#${forProp} input,#${forProp} textarea`);
      if (input) {
        input.click();
        input.focus();
      }
    }

    getPropsEvent.call(this, 'tap')(e);
  },
  render() {
    const { $mp, children, ...rest } = this.props;
    return (
      <label
        {...rest}
        onClick={this.onClick}
      >
        {children}
      </label>
    );
  },
}));
