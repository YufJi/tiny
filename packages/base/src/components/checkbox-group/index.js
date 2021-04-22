import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { createComponent } from '@/framework/';
import { getPropsEventName } from '@/utils/eventReg';
import View from '../view/View';
import formMixin from '../form/mixin';

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

    const onHandler = this.props[getPropsEventName('change', false, false)];
    if (typeof onHandler === 'function') {
      onHandler(this.props.$mp.getNormalizedEvent('change', {
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
  render() {
    return React.createElement(View, { ...this.props, role: 'group' });
  },
}));

export default CheckboxGroup;
