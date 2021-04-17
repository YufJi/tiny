
import ap from '../ap';

function LottieContext(params) {
  Object.assign(this, params);
}
const contextPrototype = LottieContext.prototype = {};

function callAction(action, params) {
  ap.call('NBComponent.sendMessage', { ...params, element: this.element, actionType: action, viewId: this.page.getViewId() });
}

function noop() {}

['play', 'stop', 'pause', 'setSpeed', 'goToAndStop', 'goToAndPlay', 'playFromMinToMaxProgress', 'playFromMinToMaxFrame', 'getDuration'].forEach((action) => {
  contextPrototype[action] = function livePlayerAction(params) {
    const { success = noop, fail = noop, complete = noop, ...rest } = params || {};

    callAction.call(this, action, {
      data: rest,
      success,
      fail,
      complete,
    });
  };
});

export default LottieContext;
