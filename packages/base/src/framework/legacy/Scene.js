import Nerv from '@/nerv';
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
    return (
      <div className="a-page tiny-page" ref={saveRoot}>
        {__render.call(__page, data)}
      </div>
    );
  }
}
