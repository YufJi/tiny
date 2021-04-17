
class Animation {
  constructor(config) {
    this.config = { ...config };
    this.config.duration = this.config.duration || 400;
    this.config.timeFunction = this.config.timeFunction || 'linear';
    this.config.transformOrigin = this.config.transformOrigin || '50% 50% 0';
    this.animations = [];
    this.currentAnimation = [];
  }

  step(config) {
    this.animations.push({
      config: { ...this.config, ...config },
      animation: this.currentAnimation,
    });
    this.currentAnimation = [];
    return this;
  }

  export() {
    const { animations } = this;
    this.animations = [];
    return animations;
  }
}
const methods = [
  'opacity', 
  'backgroundColor', 
  'width', 
  'height', 
  'top', 
  'left', 
  'bottom', 
  'right', 
  'rotate', 
  'rotateX', 
  'rotateY', 
  'rotateZ', 
  'rotate3d', 
  'skew', 
  'skewX', 
  'skewY', 
  'scale', 
  'scaleX', 
  'scaleY', 
  'scaleZ', 
  'scale3d', 
  'translate', 
  'translateX', 
  'translateY', 
  'translateZ', 
  'translate3d'
];
const proto = Animation.prototype;
methods.forEach((m) => {
  proto[m] = function run(...args) {
    this.currentAnimation.push([m, args]);
    return this;
  };
});

export default Animation;
