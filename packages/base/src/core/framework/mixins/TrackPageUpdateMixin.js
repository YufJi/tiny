
import EventHub from '../EventHub';
import { getCurrentPageImpl } from '../App';

function needReLayout(instance) {
  const { tagName } = instance.$mp;
  const _self = self;
  const { NATIVE_COMPONENTS_AUTO_ADJUST } = _self;

  return !(NATIVE_COMPONENTS_AUTO_ADJUST && tagName in NATIVE_COMPONENTS_AUTO_ADJUST);
}

const TrackPageUpdate = {
  componentDidMount() {
    const _this = this;

    if (this.isTrackPageUpdateForIOS()) {
      this.renderSeq = getCurrentPageImpl().renderSeq;
      this.detachPageUpdate = EventHub.addListener('pageUpdate', () => {
        if (needReLayout(_this) && _this.renderSeq !== getCurrentPageImpl().renderSeq) {
          _this.forceUpdate();
        }
      });
    }
  },
  componentDidUpdate() {
    if (this.isTrackPageUpdateForIOS()) {
      this.renderSeq = getCurrentPageImpl().renderSeq;
    }
  },
  componentWillUnmount() {
    if (this.isTrackPageUpdateForIOS()) {
      this.detachPageUpdate.remove();
    }
  },
};

export default TrackPageUpdate;
