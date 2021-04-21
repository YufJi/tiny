import createReactClass from 'create-react-class';
import hoistNonReactStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';
import React from 'react';
import objectKeys from '@/utils/objectKeys';
import { getCurrentPageImpl } from '../App';
import resolvePageUrl from '../utils/resolvePageUrl';
import $global from '../common/global';
import camelCase from '../utils/camelCase';
import Platform from '../Platform';
import normalizeStyle from './normalizeStyle';
import normalizeClassNameProps from './normalizeClassNameProps';
import PureRenderMixin from '../mixins/PureRenderMixin';
import TrackPageUpdateMixin from '../mixins/TrackPageUpdateMixin';

function getNormalizedSrc(source, page) {
  let src;
  if (typeof source === 'string' && source.trim()) {
    if (source.indexOf('http://') === 0
        || source.indexOf('https://') === 0
        || source.indexOf('file://') === 0
        || source.indexOf('data:image') === 0 // base64
        || source.indexOf('myfile://') === 0 // support custom protocol of IDE
        || source.indexOf('local://') === 0 // support custom protocol of IDE
        || source.indexOf('temp://') === 0 // support custom protocol of IDE
    ) {
      src = source;
    } else {
      src = resolvePageUrl(source, page || getCurrentPageImpl());
      const { mpRuntimeConfig } = self;

      if (mpRuntimeConfig && mpRuntimeConfig.contextPath) {
        src = `${mpRuntimeConfig.contextPath}/${src}`;
      } else {
        src = `/${src}`;
      }
    }
  }
  return src;
}

export default function createComponent(config = {}) {
  const { pure = true, name: tagName = '', trackPageUpdateForIOS } = config;

  return function create(WrappedComponent) {
    const mixins = pure ? [PureRenderMixin] : [];
    if (Platform.browser === 'ios') {
      mixins.push(TrackPageUpdateMixin);
    }

    const Container = createReactClass({
      displayName: `MP(${tagName})`,
      contextTypes: {
        $page: PropTypes.any,
      },
      mixins,
      getInitialState() {
        this.$mp = {
          ...this.$mp,
          bridge: $global.bridge,
          getTargetForEvent: this.getTargetForEvent,
          getNormalizedStyle: this.getNormalizedStyle,
          getAriaProps: this.getAriaProps,
          getDataProps: this.getDataProps,
          getDataset: this.getDataset,
          getNormalizedEvent: this.getNormalizedEvent,
          getNormalizedSrc,
          tagName,
          page: this.context.$page,
        };
        return {
          $style: normalizeStyle(this),
        };
      },
      componentWillReceiveProps(nextProps) {
        if (this.props.style !== nextProps.style
                // native need recomputed
                || !Platform.browser && this.props.className !== nextProps.className) {
          this.setState({
            $style: normalizeStyle(this, nextProps),
          });
        }
      },
      isTrackPageUpdateForIOS() {
        const { wrappedComponent } = this;

        return trackPageUpdateForIOS || wrappedComponent && wrappedComponent.isTrackPageUpdateForIOS && wrappedComponent.isTrackPageUpdateForIOS();
      },
      getNormalizedStyle(props) {
        if (props) {
          let goProps = props;
          if (typeof props === 'string') {
            goProps = {
              style: props,
            };
          }
          return normalizeStyle(this, goProps);
        }
      },
      getAriaProps() {
        const { props } = this;

        return objectKeys(props).reduce((prev, key) => {
          if (key === 'role' || key.match(/^aria[A-Z\-]/)) {
            prev[key] = props[key];
          }
          return prev;
        }, {});
      },
      getDataProps() {
        const { props } = this;

        return objectKeys(props).reduce((prev, key) => {
          if (key.slice(0, 5) === 'data-') {
            prev[key] = props[key];
          }
          return prev;
        }, {});
      },
      getDataset() {
        const { props } = this;

        const dataset = {};
        objectKeys(props).forEach((n) => {
          if (n.slice(0, 5) === 'data-') {
            const key = camelCase(n.slice(5));
            dataset[key] = props[n];
          }
        });
        return dataset;
      },
      getTargetForEvent() {
        const { props } = this;

        return {
          id: props.id,
          tagName,
          dataset: this.getDataset(),
        };
      },
      /* 格式化event对象 */
      getNormalizedEvent(eventParam, other) {
        let eventType = eventParam;
        let srcEvent;
        if (eventType.eventType) {
          srcEvent = eventType.srcEvent;
          eventType = eventType.eventType;
        }
        const nativeEvent = srcEvent && srcEvent.nativeEvent || srcEvent;
        const currentTarget = this.getTargetForEvent();
        let target = nativeEvent && nativeEvent.$target || currentTarget;
        if (nativeEvent && !nativeEvent.$target) {
          nativeEvent.$target = target;
        }
        // bug compatibility
        target = {
          targetDataset: target.dataset,
          ...target,
          dataset: currentTarget.dataset,
        };

        return {
          type: eventType,
          timeStamp: Date.now(),
          target,
          currentTarget,
          ...other,
        };
      },
      saveRef(c) {
        this.wrappedComponent = c;
      },
      getWrappedComponent() {
        return this.wrappedComponent;
      },
      $getNormalizedProps() {
        const { slot, ...props } = this.props;
        props.$mp = this.$mp;
        normalizeClassNameProps(props);
        delete props.style;
        if (this.state.$style) {
          props.style = this.state.$style;
        } else {
          props.style = undefined;
        }
        const { $numProps } = this.constructor;

        if ($numProps) {
          $numProps.forEach((prop) => {
            if (typeof props[prop] === 'string') {
              props[prop] = parseFloat(props[prop]);
            }
          });
        }
        return props;
      },
      render() {
        const props = this.$getNormalizedProps();
        if (WrappedComponent.prototype.render) {
          props.ref = this.saveRef;
        }

        return React.createElement(WrappedComponent, {
          ...props,
        });
      },
    });

    const RetComponent = hoistNonReactStatics(Container, WrappedComponent);
    const $numProps = [];
    const { defaultProps } = WrappedComponent;
    if (defaultProps) {
      objectKeys(defaultProps).forEach((prop) => {
        if (typeof defaultProps[prop] === 'number') {
          $numProps.push(prop);
        }
      });
      if ($numProps.length) {
        RetComponent.$numProps = $numProps;
      }
    }
    return RetComponent;
  };
}
