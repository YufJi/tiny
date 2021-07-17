/*
 * @Author: YufJ
 * @Date: 2021-04-30 13:10:14
 * @LastEditTime: 2021-07-12 10:57:04
 * @Description:
 * @FilePath: /tiny-v1/packages/base/src/nerv/pure-component.ts
 */
import { shallowEqual } from '@/nerv/utils';
import Component from './component';

class PureComponent<P, S> extends Component<P, S> {
  isPureComponent = true

  shouldComponentUpdate(nextProps: P, nextState: S) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
}

export default PureComponent;
