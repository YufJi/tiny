import Nerv, { createNervClass } from '@/nerv';

import { createComponent } from '@/framework/';
import { getPropsEvent } from '@/utils/eventReg';
import View from '../view/View';
import formMixin from '../form/mixin';

const CheckboxGroup = createComponent({
  pure: false,
  name: 'checkbox-group',
})(createNervClass({
  displayName: 'CheckboxGroup',
  mixins: [formMixin],
  getChildContext: function getChildContext() {
    return {
      checkboxGroup: this,
    };
  },

  onChange(e) {
    const { value2, value } = e.detail;

    this.updateValue(value2, value);

    getPropsEvent.call(this, 'change')(this.props.$mp.getNormalizedEvent('change', {
      detail: {
        value: this.state.value,
      },
    }));
  },
  updateValue(value, checked) {
    const allValue = this.state.value && this.state.value || [];
    if (checked && allValue.indexOf(value) === -1) {
      allValue.push(value);
    } else if (!checked) {
      const index = allValue.indexOf(value);
      if (index !== -1) {
        allValue.splice(index, 1);
      }
    }
    this.state.value = allValue;
  },
  render() {
    const { ...rest } = this.props;
    return Nerv.createElement(View, { ...rest, role: 'group' });
  },
}));

export default CheckboxGroup;
