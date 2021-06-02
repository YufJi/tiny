import Nerv from '@/nerv';
import { elementPrefix } from '@/utils/config';
import EventHub from '../EventHub';

export default class Scene extends Nerv.Component {
  componentDidMount() {
    const { __page } = this.props;
    const e = { page: __page };

    EventHub.emit('pageLoad', e);
    __page.callRemote('self', 'load');
  }

  render() {
    const { data, saveRoot, __page, __render } = this.props;

    return Nerv.createElement(`${elementPrefix}-page`, {
      ref: saveRoot,
    }, __render.call(__page, data));
  }
}
