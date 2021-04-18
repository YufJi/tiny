import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '@/framework/';
import addEvents from '@/utils/addEvents';
import callBridge from '@/utils/callBridge';
import rgba2Color from '@/utils/rgba2Color';
import { isNativeComponent } from '@/utils/system';
import debounce from '@/utils/debounce';

let id = 0;
const CoverView = createComponent({
  name: 'cover-view',
})(createReactClass({
  displayName: 'CoverView',
  componentDidMount: function componentDidMount() {
    if (!isNativeComponent) {
      return;
    }
    const { parentNode } = this.coverViewRef;
    if (parentNode.dataset.component !== 'cover-view') {
      this.renderCoverView = debounce(this.renderCoverView, 30, undefined);
    }
    this.renderCoverView();
    this.coverViewEvents = addEvents(document, {
      'nbcomponent.text.bindtap': this.onCoverViewTap,
    });
    // 首次执行完后，记录NBType是否有变化
    this.NBTypeChanged = false;
    this.coverViewReRenderEvents = addEvents(document, {
      coverViewReRender: this.onCoverViewReRender,
      coverImageReRender: this.onCoverViewReRender,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    if (!isNativeComponent) {
      return;
    }
    this.checkNBTypeChanged();
    this.renderCoverView();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (!isNativeComponent) {
      return;
    }
    callBridge('NBComponent.remove', {
      element: this.getId(),
    });
    this.coverViewEvents.remove();
    this.coverViewReRenderEvents.remove();
  },
  onCoverViewTap: function onCoverViewTap(_ref) {
    const { element } = _ref.data;
    const _props = this.props;
    const { onTap } = _props;
    const { $mp } = _props;

    if (onTap && element === this.getId()) {
      onTap($mp.getNormalizedEvent('tap'));
    }
  },
  onTap: function onTap() {
    const _props2 = this.props;
    const { onTap } = _props2;
    const { $mp } = _props2;

    if (onTap) {
      onTap($mp.getNormalizedEvent('tap'));
    }
  },
  onCoverViewReRender: function onCoverViewReRender(e) {
    const { node } = e.detail;

    const { parentNode } = this.coverViewRef;
    if (parentNode.dataset.component !== 'cover-view' && this.coverViewRef.contains(node)) {
      this.renderCoverView();
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_coverView_${++id}`;
    return this.id;
  },
  checkNBTypeChanged: function checkNBTypeChanged() {
    // NBType一旦有变化，先销毁，后续cover-view最外层节点会重新render
    if (this.NBTypeChanged) {
      callBridge('NBComponent.remove', {
        version: '2.0',
        element: this.getId(),
      });
      this.NBTypeChanged = false;
    }
  },
  dispatchCoverViewReRender: function dispatchCoverViewReRender() {
    document.dispatchEvent(new CustomEvent('coverViewReRender', {
      detail: {
        node: this.coverViewRef,
      },
    }));
  },
  renderCoverView: function renderCoverView() {
    const computedStyle = window.getComputedStyle(this.coverViewRef, null);
    const backgroundColor = rgba2Color(computedStyle['background-color']);
    const borderWidth = parseInt(computedStyle['border-width']);
    const borderStyle = computedStyle['border-style'];
    const borderColor = rgba2Color(computedStyle['border-color']);
    const borderRadius = parseInt(computedStyle['border-radius']);
    const { parentNode } = this.coverViewRef;
    // 纯文字，渲染成text
    if (this.hasNotStringTypeChild === false) {
      const text = this.coverViewRef.innerHTML;
      const color = rgba2Color(computedStyle.color);
      const fontSize = parseFloat(computedStyle['font-size']).toFixed(2);
      const textAlign = computedStyle['text-align'];
      // 首次渲染 且是cover-view的子元素，则先不执行NBRender，将相关数据更新到dom节点，最后由最外层的元素统一执行NBRender。
      this.coverViewRef.setAttribute('nbcomponent-data', `{"text": "${text}", "backgroundColor": "${backgroundColor}", "color": "${color}", "fontSize": "${fontSize}", "textAlign": "${textAlign}", "borderWidth": "${borderWidth}", "borderStyle": "${borderStyle}", "borderColor": "${borderColor}", "borderRadius": "${borderRadius}"}`);
      if (parentNode.dataset.component !== 'cover-view') {
        // didUpdate时或者没有子元素时通过JSAPI来渲染数据
        callBridge('NBComponent.render', {
          version: '2.0',
          element: this.getId(),
          data: {
            text,
            backgroundColor,
            color,
            fontSize,
            textAlign,
            borderWidth,
            borderStyle,
            borderColor,
            borderRadius,
          },
        });
      } else {
        this.dispatchCoverViewReRender();
      }
    } else {
      const _props$scrollTop = this.props.scrollTop;
      const scrollTop = _props$scrollTop === undefined ? 0 : _props$scrollTop;
      // 有子元素时渲染成container类型或者scrollview类型

      if (computedStyle['overflow-y'] === 'scroll') {
        this.coverViewRef.setAttribute('nbcomponent-type', 'scrollview');
      }
      this.coverViewRef.setAttribute('nbcomponent-data', `{"backgroundColor": "${backgroundColor}", "scrollTop": "${scrollTop}", "borderWidth": "${borderWidth}", "borderStyle": "${borderStyle}", "borderColor": "${borderColor}", "borderRadius": "${borderRadius}"}`);
      if (parentNode.dataset.component !== 'cover-view') {
        callBridge('NBComponent.render', {
          version: '2.0',
          element: this.getId(),
          data: {
            backgroundColor,
            scrollTop,
            borderWidth,
            borderStyle,
            borderColor,
            borderRadius,
          },
        });
      } else {
        this.dispatchCoverViewReRender();
      }
    }
    document.dispatchEvent(new CustomEvent('pageReRender', {}));
  },
  saveRef: function saveRef(ref) {
    this.coverViewRef = ref;
  },
  render: function render() {
    const { style, className, children } = this.props;

    if (!isNativeComponent) {
      return React.createElement(
        'div',
        { className, id: this.getId(), style, onClick: this.onTap },
        children,
      );
    }
    // 是否含有非字符串的child
    let hasNotStringTypeChild = false;
    let nbtype = 'text';
    React.Children.forEach(children, (child) => {
      if (!(typeof child === 'string' || typeof child === 'number')) {
        hasNotStringTypeChild = true;
        nbtype = 'container';
      }
    });
    // 首次渲染, this.NBTypeChanged 还未定义
    if (this.NBTypeChanged === undefined) {
      this.hasNotStringTypeChild = hasNotStringTypeChild;
      // didMount之后才赋值为false
    } else if (hasNotStringTypeChild !== this.hasNotStringTypeChild) {
      this.hasNotStringTypeChild = hasNotStringTypeChild;
      this.NBTypeChanged = true;
    }
    return React.createElement(
      'div',
      { className: `nbcomponent ${className}`, 'data-component': 'cover-view', id: this.getId(), 'nbcomponent-type': hasNotStringTypeChild ? 'container' : 'text', style, ref: this.saveRef },
      children,
    );
  },
}));

export default CoverView;
