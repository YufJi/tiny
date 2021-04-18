import shallowEqual from '@/utils/shallowEqual';

const PureRender = {
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state);
  },
};

export default PureRender;
