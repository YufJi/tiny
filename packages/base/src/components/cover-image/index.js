import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '@/framework/';
import { isNativeComponent } from '@/utils/system';
import addEvents from '@/utils/addEvents';
import callBridge from '@/utils/callBridge';

let id = 0;
const CoverImage = createComponent({
  name: 'cover-image',
})(createReactClass({
  displayName: 'CoverImage',
  componentDidMount: function componentDidMount() {
    if (!isNativeComponent) {

    } else {
      this.renderCoverImage();
      this.coverImageEvents = addEvents(document, {
        'nbcomponent.image.bindtap': this.onCoverImageTap,
      });
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    if (!isNativeComponent) {

    } else {
      this.renderCoverImage();
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (!isNativeComponent) {

    } else {
      callBridge('NBComponent.remove', {
        element: this.getId(),
      });
      this.coverImageEvents.remove();
    }
  },
  onCoverImageTap: function onCoverImageTap({ data }) {
    const { element } = data;
    const { onTap, $mp } = this.props;

    if (onTap && element === this.getId()) {
      onTap($mp.getNormalizedEvent('tap'));
    }
  },
  onTap: function onTap() {
    const { onTap, $mp } = this.props;

    if (onTap) {
      onTap($mp.getNormalizedEvent('tap'));
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_coverImage_${++id}`;
    return this.id;
  },
  dispatchCoverImageReRender: function dispatchCoverImageReRender() {
    document.dispatchEvent(new CustomEvent('coverImageReRender', {
      detail: {
        node: this.coverImageRef,
      },
    }));
  },
  renderCoverImage: function renderCoverImage() {
    const { $mp, src } = this.props;

    const { parentNode } = this.coverImageRef;
    // 如果父元素为cover-view 则交由父元素统一渲染
    if (parentNode.dataset.component !== 'cover-view') {
      callBridge('NBComponent.render', {
        version: '2.0',
        element: this.getId(),
        data: {
          src: $mp.getNormalizedSrc(src),
        },
      });
    } else {
      this.dispatchCoverImageReRender();
    }
    document.dispatchEvent(new CustomEvent('pageReRender', {}));
  },
  saveRef: function saveRef(ref) {
    this.coverImageRef = ref;
  },
  render: function render() {
    const { $mp, src, style, className } = this.props;

    if (!isNativeComponent) {
      return React.createElement('img', { style, className, id: this.getId(), src: $mp.getNormalizedSrc(src), onClick: this.onTap, ref: this.saveRef });
    }
    return React.createElement('div', { style, className: `nbcomponent ${className}`, id: this.getId(), 'nbcomponent-type': 'image', 'nbcomponent-data': `{"src": "${$mp.getNormalizedSrc(src)}"}`, ref: this.saveRef });
  },
}));

export default CoverImage;
