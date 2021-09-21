import { pinOneAction, toDashcase } from './util';

export function createAnimation(param = {}) {
  return new CreateAnimation(param);
}

function CreateAnimation(param = {}) {
  this.actions = [];

  this.currentTransform = [];
  this.currentStepAnimates = [];
  this.option = {
    duration: typeof param.duration === 'number' && param.duration >= 0 ? param.duration : 400,
    timingFunction: param.timingFunction || 'linear',
    delay: param.delay || 0,
    transformOrigin: param.transformOrigin || '50% 50% 0',
  };
}

CreateAnimation.prototype.export = function () {
  const steps = this.actions;
  this.actions = [];

  return { steps };
};

CreateAnimation.prototype.step = function (currentOption = {}) {
  this.currentStepAnimates.forEach((step) => {
    if (step.type === 'style') {
      this.currentTransform[`${step.type}.${step.args[0]}`] = step;
    } else {
      this.currentTransform[step.type] = step;
    }
  });
  const animates = Object.keys(this.currentTransform).reduce((res, key) => {
    return [].concat(res, [this.currentTransform[key]]);
  }, []);
  const option = { ...this.option, ...currentOption };
  this.actions.push({
    text: pinOneAction({
      animates,
      option,
    }),
    option,
  });
  this.currentStepAnimates = [];
  return this;
};

CreateAnimation.prototype.scale = function (sx = 1, sy = sx) {
  this.currentStepAnimates.push({
    type: 'scale',
    args: [sx, sy],
  });
  return this;
};

CreateAnimation.prototype.translate = function (tx = 0, ty = 0) {
  this.currentStepAnimates.push({
    type: 'translate',
    args: [tx, ty],
  });
  return this;
};

CreateAnimation.prototype.skew = function (ax = 0, ay = 0) {
  this.currentStepAnimates.push({
    type: 'skew',
    args: [ax, ay],
  });
  return this;
};

CreateAnimation.prototype.rotate3d = function (x = 0, y = 0, z = 0, a = 0) {
  this.currentStepAnimates.push({
    type: 'rotate3d',
    args: [x, y, z, a],
  }); // this.stepping = false;

  return this;
};

CreateAnimation.prototype.scale3d = function (sx = 1, sy = 1, sz = 1) {
  this.currentStepAnimates.push({
    type: 'scale3d',
    args: [sx, sy, sz],
  });
  return this;
};

CreateAnimation.prototype.translate3d = function (tx = 0, ty = 0, tz = 0) {
  this.currentStepAnimates.push({
    type: 'translate3d',
    args: [tx, ty, tz],
  });
  return this;
};

CreateAnimation.prototype.matrix = function (a = 1, b = 0, c = 0, d = 1, tx = 1, ty = 1) {
  this.currentStepAnimates.push({
    type: 'matrix',
    args: [a, b, c, d, tx, ty],
  });
  return this;
};

CreateAnimation.prototype.matrix3d = function (a1 = 1, b1 = 0, c1 = 0, d1 = 0, a2 = 0, b2 = 1, c2 = 0, d2 = 0, a3 = 0, b3 = 0, c3 = 1, d3 = 0, a4 = 0, b4 = 0, c4 = 0, d4 = 1) {
  this.currentStepAnimates.push({
    type: 'matrix3d',
    args: [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4],
  });
  // this.stepping = false;

  return this;
};

['opacity', 'backgroundColor'].forEach((property) => {
  CreateAnimation.prototype[property] = function (value) {
    this.currentStepAnimates.push({
      type: 'style',
      args: [toDashcase(property), value],
    });
    return this;
  };
});

['width', 'height', 'top', 'bottom', 'left', 'right'].forEach((direction) => {
  CreateAnimation.prototype[direction] = function (length) {
    if (typeof length === 'number') {
      length += 'px';
    }

    this.currentStepAnimates.push({
      type: 'style',
      args: [direction, length],
    });
    return this;
  };
});
// 旋转
['rotate', 'rotateX', 'rotateY', 'rotateZ'].forEach((method) => {
  CreateAnimation.prototype[method] = function (angle = 0) {
    this.currentStepAnimates.push({
      type: method,
      args: [angle],
    });
    // if (method !== 'rotate') {
    //     this.stepping = false;
    // }

    return this;
  };
});
// rotate3d
// 缩放
['scaleX', 'scaleY', 'scaleZ'].forEach((method) => {
  CreateAnimation.prototype[method] = function (scale = 1) {
    this.currentStepAnimates.push({
      type: method,
      args: [scale],
    });
    return this;
  };
});

// scale, scale3d
// 偏移
// translate, translate3d
['translateX', 'translateY', 'translateZ'].forEach((method) => {
  CreateAnimation.prototype[method] = function (value = 0) {
    this.currentStepAnimates.push({
      type: method,
      args: [value],
    });
    return this;
  };
});
// 倾斜
// skew
['skewX', 'skewY'].forEach((method) => {
  CreateAnimation.prototype[method] = function (value = 0) {
    this.currentStepAnimates.push({
      type: method,
      args: [value],
    });
    return this;
  };
});
