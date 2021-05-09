import Nerv, { createNervClass } from '@/nerv';
import View from '@/view/View';
import TestMixin from '@/utils/TestMixin';

export default createNervClass({
  displayName: 'View',
  mixins: [TestMixin],
  render: function render() {
    const { props } = this;

    return Nerv.createElement(View, { ...props, userProps: props });
  },
});
