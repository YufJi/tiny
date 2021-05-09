import { shallowEqual } from '@/nerv/utils';
import Component from './component';

class PureComponent<P, S> extends Component<P, S> {
  isPureComponent = true

  shouldComponentUpdate(nextProps: P, nextState: S) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
}

export default PureComponent;
