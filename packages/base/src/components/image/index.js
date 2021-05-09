import Nerv, { createNervClass } from '@/nerv';
import { createComponent } from '@/framework/';
import View from '../view/View';
import modeStyle from './modeStyle';

const ImageTag = 'img';
const widthFixStyle = {
  visibility: 'hidden',
  width: '100%',
};

export default createComponent({
  name: 'image',
})(createNervClass({
  displayName: 'Image',
  getInitialState() {
    return {
      lazyLoaded: !this.props.lazyLoad,
      loaded: false,
    };
  },
  getDefaultProps() {
    return {
      mode: 'scaleToFill',
      lazyLoad: false,
    };
  },
  componentDidMount() {
    if (this.state.lazyLoaded) {
      this.initImg();
      this.updateSrc();
    }
  },
  componentDidUpdate(prevProps) {
    if (this.state.lazyLoaded) {
      this.initImg();
      if (this.props.src !== prevProps.src || this.props.lazyLoad && !this.lazyLoaded) {
        this.lazyLoaded = true;
        this.updateSrc();
      }
    }
  },
  shouldOnLoad() {
    return this.props.defaultSource || this.props.onLoad;
  },
  shouldOnError() {
    return this.props.defaultSource || this.props.onError;
  },
  initImg() {
    const { onLoad, onError, defaultSource, mode } = this.props;

    if (mode === 'widthFix' || !onLoad && !onError && !defaultSource) {
      if (this.img) {
        this.img.onload = null;
        this.img.onerror = null;
        this.img = null;
      }

      return;
    }
    const img = this.img = this.img || new Image();
    if (this.shouldOnLoad() && !img.onload) {
      img.onload = this.onLoad;
    }
    if (this.shouldOnError() && !img.onerror) {
      img.onerror = this.onError;
    }
  },
  updateSrc() {
    if (this.props.src && this.img) {
      this.img.src = this.props.$mp.getNormalizedSrc(this.props.src);
    }
  },
  onLoad(e) {
    // replace defaultSource with src
    if (this.props.defaultSource) {
      this.setState({
        loaded: true,
      });
    }
    if (this.props.onLoad) {
      const img = e.target;
      this.props.onLoad(this.props.$mp.getNormalizedEvent('load', {
        detail: {
          width: img.naturalWidth,
          height: img.naturalHeight,
        },
      }));
    }
    document.dispatchEvent(new CustomEvent('pageReRender', {}));
  },
  onError() {
    if (this.props.defaultSource) {
      this.setState({
        loaded: false,
      });
    }
    if (this.props.onError) {
      this.props.onError(this.props.$mp.getNormalizedEvent('error', {
        detail: {
          errMsg: 'unknown error',
        },
      }));
    }
  },
  onImageLazyLoad() {
    const { lazyLoaded } = this.state;

    if (!lazyLoaded) {
      this.setState({
        lazyLoaded: true,
      });
    }
  },
  render() {
    const { className, id, mode, alt, $mp, onTap, onLongTap, onTouchStart, onTouchMove, onTouchCancel, onTouchEnd, lazyLoad } = this.props;
    let { src, defaultSource, style } = this.props;
    const { lazyLoaded } = this.state;

    src = $mp.getNormalizedSrc(src);
    defaultSource = defaultSource && $mp.getNormalizedSrc(defaultSource);
    let onAppearProp = {};
    if (lazyLoad && !lazyLoaded) {
      onAppearProp = {
        onAppear: this.onImageLazyLoad,
        appearOffset: 50,
      };
    }
    style = { backgroundImage: src && lazyLoaded ? defaultSource ? `url(${this.state.loaded ? src : defaultSource})` : `url(${src})` : undefined, ...style, ...modeStyle[mode] };
    // must has data props, or image onTap lose data
    let img = null;
    if (mode === 'widthFix' && lazyLoaded) {
      img = Nerv.createElement(ImageTag, {
        src,
        style: widthFixStyle,
        onLoad: this.shouldOnLoad() ? this.onLoad : undefined,
        onError: this.shouldOnError() ? this.onError : undefined,
      });
    }
    return Nerv.createElement(
      View,
      {
        className,
        id,
        'aria-label': alt,
        $mp,
        style,
        onTap,
        onLongTap,
        onTouchStart,
        onTouchMove,
        onTouchCancel,
        onTouchEnd,
        ...$mp.getAriaProps(),
        ...$mp.getDataProps(),
        ...onAppearProp,
      },
      img,
    );
  },
}));
