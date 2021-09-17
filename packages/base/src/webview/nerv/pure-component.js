/*
 * @Author: YufJ
 * @Date: 2021-04-30 13:10:14
 * @LastEditTime: 2021-07-12 20:52:52
 * @Description:
 * @FilePath: /yeact/src/pure-component.js
 */
import { shallowEqual } from './utils';
import Component from './component';

class PureComponent extends Component {
  isPureComponent = true

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
}

export default PureComponent;
