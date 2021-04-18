
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import View from '../view/View';
import formMixin from '../form/mixin';
import { createComponent } from '@/framework/';


const CheckboxGroup = createComponent({
  pure: false,
  name: 'checkbox-group',
})(createReactClass({
  displayName: 'CheckboxGroup',
  childContextTypes: {
    checkboxGroup: PropTypes.any,
  },
  mixins: [formMixin],
  getChildContext: function getChildContext() {
    return {
      checkboxGroup: this,
    };
  },

  onChange(e) {
    const { value2, value } = e.detail;

    this.updateValue(value2, value);
    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value: this.state.value,
        },
      }));
    }
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
  render: function render() {
    return React.createElement(View, { ...this.props, role: 'group' });
  },
}));

export default CheckboxGroup;
