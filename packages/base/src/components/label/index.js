import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '@/framework/';

export default createComponent({
  pure: false,
  name: 'label',
})(createReactClass({
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
    return React.createElement('label', { ...this.props, onClick: this.onClick });
  },
}));
