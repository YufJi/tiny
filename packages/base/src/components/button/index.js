import Nerv, { createNervClass } from '@/nerv';
import { createComponent, getCurrentPageImpl } from '@/framework/';
import callInternalAPI from '@/utils/callInternalAPI';
import callBridge from '@/utils/callBridge';
import TestMixin from '@/utils/TestMixin';
import trackTap from '@/utils/trackTap';
import { getPropsEvent } from '@/utils/eventReg';
import Button from '../shared/Button';

const FollowStatus = {
  followed: 1,
  userCancel: 2,
  unknownError: 3,
};

const AButton = createComponent({
  name: 'button',
})(createNervClass({
  displayName: 'Button',
  mixins: [
    TestMixin,
  ],
  getDefaultProps: function getDefaultProps() {
    return {
      hoverStartTime: 20,
      hoverStayTime: 70,
      hoverClass: 'a-button-active',
    };
  },
  addFollow: function addFollow() {
    const _props = this.props;
    const { publicId } = _props;
    const { onFollowLifestyle } = _props;
    const { $mp } = _props;

    callInternalAPI('addFollow', {
      publicId,
      sourceId: 'tinyApp',
    }, (res) => {
      const followed = res.success === 'true';
      if (onFollowLifestyle) {
        onFollowLifestyle($mp.getNormalizedEvent('follow', {
          detail: {
            followStatus: followed ? FollowStatus.followed : FollowStatus.unknownError,
          },
        }));
      }
      callBridge('toast', { content: followed ? '关注成功' : '关注失败' });
    });
  },
  onButtonTap(e) {
    const _this = this;

    getPropsEvent.call(this, 'tap')(e);

    const { formType, openType, appParameter, $mp } = this.props;
    const { form } = this.context;

    if (form) {
      if (formType === 'submit') {
        form.submit(this.props.$mp.getDataset());
      } else if (formType === 'reset') {
        form.reset();
      }
    }
    if (openType === 'share') {
      const page = getCurrentPageImpl();
      if (page && page.publicInstance.onShareAppMessage) {
        page.callRemote('self', 'startShare', $mp.getNormalizedEvent('share'));
      }
    }
    if (openType === 'getAuthorize') {
      const _props3 = this.props;
      const { onGetAuthorize } = _props3;
      const { onError } = _props3;
      const { scope } = _props3;

      if (!scope || typeof scope !== 'string') {
        if (onError) {
          onError($mp.getNormalizedEvent('error', {
            detail: {
              errorMessage: '请输入合法的scope',
              type: 'getAuthorize',
            },
          }));
        }
      } else {
        const scopes = scope.replace(/ /g, '').split(',');
        callInternalAPI('getComponentAuth', {
          scopeNicks: scopes,
        }, (res) => {
          if (res.error) {
            if (onError) {
              onError($mp.getNormalizedEvent('error', {
                detail: {
                  errorMessage: res.errorMessage || res.errorDesc,
                  type: 'getAuthorize',
                },
              }));
            }
          } else if (onGetAuthorize) {
            onGetAuthorize($mp.getNormalizedEvent('getAuthorize'));
          }
        });
      }
    }
    if (openType === 'launchApp') {
      callInternalAPI('launchApp', {
        resultData: appParameter,
      }, (res) => {
        const { onError } = _this.props;

        if (res.error) {
          if (onError) {
            onError($mp.getNormalizedEvent('error', {
              detail: {
                errorMessage: res.errorMessage,
                type: 'launchApp',
              },
            }));
          }
        }
      });
    }
    if (openType === 'contactShare') {
      const _page = getCurrentPageImpl();
      if (_page && _page.publicInstance.onShareAppMessage) {
        _page.callRemote('self', 'shareToAlipayContact', $mp.getNormalizedEvent('share'));
      }
    }
    // trackTap(this);
    // this.logTestId();
  },
  render: function render() {
    const { props } = this;

    let { type } = props;
    if (props.plain) {
      type = 'ghost';
    }

    return Nerv.createElement(
      Button,
      {
        id: props.id,
        size: props.size,
        activeStopPropagation: props.hoverStopPropagation,
        activeClassName: props.hoverClass,
        className: props.className,
        style: props.style,
        delayPressIn: props.hoverStartTime,
        delayPressOut: props.hoverStayTime,
        onClick: this.onButtonTap,
        type,
        disabled: props.disabled,
        loading: props.loading,
        ...props.$mp.getAriaProps(),
      },
      props.children,
    );
  },
}));

export default AButton;
