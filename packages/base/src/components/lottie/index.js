import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '@/framework/';
import { isAndroid, isNativeComponent } from '@/utils/system';
import addEvents from '@/utils/addEvents';
import callBridge from '@/utils/callBridge';

let id = 0;
const cacheLottieId = {};
const Lottie = createComponent({
  name: 'lottie',
  trackPageUpdateForIOS: true,
})(createReactClass({
  displayName: 'Lottie',
  getDefaultProps: function getDefaultProps() {
    return {
      autoplay: false,
      speed: 1.0,
      repeatCount: 0,
      autoReverse: false,
    };
  },
  componentDidMount: function componentDidMount() {
    // android bug
    if (isAndroid && !cacheLottieId[this.getId()]) {
      this.readyForRender = false;
      this.detachLottieReady = addEvents(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderLottie();
    }
    this.detachEvents = addEvents(document, {
      'nbcomponent.lottieview.dataReady': this.onDataReady,
      'nbcomponent.lottieview.dataFailed': this.onDataFailed,
      'nbcomponent.lottieview.animationStart': this.onAnimationStart,
      'nbcomponent.lottieview.animationEnd': this.onAnimationEnd,
      'nbcomponent.lottieview.animaitionRepeat': this.onAnimaitionRepeat,
      'nbcomponent.lottieview.animationCancel': this.onAnimationCancel,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderLottie();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.detachLottieReady) {
      this.detachLottieReady.remove();
    }
    callBridge('NBComponent.remove', {
      element: this.getId(),
    });
    this.detachEvents.remove();
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheLottieId[this.getId()] = true;
      this.renderLottie();
    }
  },
  onDataReady: function onDataReady(e) {
    const { element } = e.data;
    const _props = this.props;
    const { $mp } = _props;
    const { onDataReady } = _props;

    if (this.getId() === element && onDataReady) {
      onDataReady($mp.getNormalizedEvent('dataReady'));
    }
  },
  onDataFailed: function onDataFailed(e) {
    const { element } = e.data;
    const _props2 = this.props;
    const { $mp } = _props2;
    const { onDataFailed } = _props2;

    if (this.getId() === element && onDataFailed) {
      onDataFailed($mp.getNormalizedEvent('dataFailed'));
    }
  },
  onAnimationStart: function onAnimationStart(e) {
    const { element } = e.data;
    const _props3 = this.props;
    const { $mp } = _props3;
    const { onAnimationStart } = _props3;

    if (this.getId() === element && onAnimationStart) {
      onAnimationStart($mp.getNormalizedEvent('animationStart'));
    }
  },
  onAnimationEnd: function onAnimationEnd(e) {
    const { element } = e.data;
    const _props4 = this.props;
    const { $mp } = _props4;
    const { onAnimationEnd } = _props4;

    if (this.getId() === element && onAnimationEnd) {
      onAnimationEnd($mp.getNormalizedEvent('animationEnd'));
    }
  },
  onAnimaitionRepeat: function onAnimaitionRepeat(e) {
    const { element } = e.data;
    const { $mp, onAnimaitionRepeat } = this.props;

    if (this.getId() === element && onAnimaitionRepeat) {
      onAnimaitionRepeat($mp.getNormalizedEvent('animaitionRepeat'));
    }
  },
  onAnimationCancel: function onAnimationCancel(e) {
    const { element } = e.data;
    const { $mp, onAnimationCancel } = this.props;

    if (this.getId() === element && onAnimationCancel) {
      onAnimationCancel($mp.getNormalizedEvent('animationCancel'));
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachLottieReady) {
      this.detachLottieReady.remove();
      this.detachLottieReady = null;
    }
  },
  renderLottie: function renderLottie() {
    if (!this.readyForRender || !isNativeComponent) {
      return;
    }
    this.clearRenderDelay();
    const { autoplay, path, speed, repeatCount, autoReverse, $mp, assetsPath } = this.props;

    callBridge('NBComponent.render', {
      element: this.getId(),
      data: {
        autoplay,
        path: $mp.getNormalizedSrc(path),
        speed,
        repeatCount,
        autoReverse,
        assetsPath: $mp.getNormalizedSrc(assetsPath),
      },
    });
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_lottie_${++id}`;
    return this.id;
  },
  render: function render() {
    const { style, className, id } = this.props;

    if (!isNativeComponent) {
      return React.createElement(
        'div',
        { className, style, id },
        '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301lottie\u7EC4\u4EF6',
      );
    }
    return React.createElement(
      'object',
      {
        className: `${className} nbcomponentanimation-${this.getId()}`,
        style,
        id,
        type: 'application/view',
        role: 'application'
      },
      React.createElement('param', { name: 'type', value: 'lottieview' }),
      React.createElement('param', { name: 'id', value: this.getId() }),
    );
  },
}));

export default Lottie;
