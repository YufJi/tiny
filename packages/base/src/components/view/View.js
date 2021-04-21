import React from 'react';
import createReactClass from 'create-react-class';
import View from '@/view/View';
import TestMixin from '@/utils/TestMixin';

export default createReactClass({
  displayName: 'View',
  mixins: [TestMixin],
  render: function render() {
    const { props } = this;

    return React.createElement(View, { testProps: this.getTestProps(), ...props, userProps: props });
  },
});
