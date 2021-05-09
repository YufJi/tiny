import Nerv, { createNervClass } from '@/nerv';
import { createComponent } from '@/framework/';
import formMixin from '../form/mixin';
import View from '../view/View';

const RadioGroup = createComponent({
  pure: false,
  name: 'radio-group',
})(createNervClass({
  displayName: 'RadioGroup',
  mixins: [formMixin],
  getChildContext: function getChildContext() {
    return {
      radioGroup: this,
    };
  },
  getInitialState: function getInitialState() {
    this.radioListeners = [];
  },
  updateValue: function updateValue(value) {
    this.state.value = value;
  },
  onChange: function onChange(e) {
    this.state.value = e.detail.value;
    this.updateFormValue();
    this.radioListeners.forEach((fn) => {
      return fn();
    });
    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value: this.state.value,
        },
      }));
    }
  },
  render: function render() {
    return Nerv.createElement(View, { ...this.props, role: 'radiogroup' });
  },
}));

export default RadioGroup;
