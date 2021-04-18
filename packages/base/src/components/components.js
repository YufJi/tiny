
import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '@/framework/';
import { rpx } from '@/framework/utils/unit';
import Icon from './shared/Icon';
import callInternalAPI from '@/utils/callInternalAPI';

const ContactButton = createComponent({
  name: 'contact-button',
})(createReactClass({
  displayName: 'ContactButton',
  onTap: function onTap() {
    const _props = this.props;
    const { tntInstId } = _props;
    const { scene } = _props;
    const { alipayCardNo } = _props;
    const { extInfo } = _props;

    callInternalAPI('startApp', {
      appId: '2017112000050756',
      param: {
        page: `pages/cschat/cschat?tntInstId=${tntInstId}&scene=${scene}&alipayCardNo=${alipayCardNo}&extInfo=${encodeURIComponent(extInfo)}`,
      },
    });
  },
  render: function render() {
    const _props2 = this.props;
    const _props2$color = _props2.color;
    const color = _props2$color === undefined ? '#00A3FF' : _props2$color;
    const { icon } = _props2;
    const { $mp } = _props2;
    const _props$size = this.props.size;
    let size = _props$size === undefined ? 25 : _props$size;

    if ((`${size}`).indexOf('rpx') > -1) {
      size = rpx(parseInt(size));
    }
    const props = { size, color };
    let content = React.createElement(Icon, { type: 'contact-button', ...props });
    if (icon) {
      content = React.createElement('img', { src: $mp.getNormalizedSrc(icon), style: { width: parseFloat(size) } });
    }
    return React.createElement(
      'div',
      { className: 'a-contact-button', onClick: this.onTap },
      content,
    );
  },
}));

export default ContactButton;
