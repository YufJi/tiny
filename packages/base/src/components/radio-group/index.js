
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { createComponent } from '@/framework/';
import formMixin from '../form/mixin';
import View from '../view/View';

const RadioGroup = createComponent({
  pure: false,
  name: 'radio-group',
})(createReactClass({
  displayName: 'RadioGroup',
  mixins: [formMixin],
  childContextTypes: {
    radioGroup: PropTypes.any,
  },
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
    return React.createElement(View, { ...this.props, role: 'radiogroup' });
  },
}));

export default RadioGroup;
