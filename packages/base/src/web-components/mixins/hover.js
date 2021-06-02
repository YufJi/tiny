import supportsPassive from '@/utils/supportsPassive';

const PASSIVE_TOUCH = supportsPassive ? { passive: true } : undefined;

export default function Hover(SuperClass) {
  return class extends SuperClass {
    static get properties() {
      return {
        hoverStartTime: {
          type: Number,
          value: 50,
        },
        hoverStayTime: {
          type: Number,
          value: 400,
        },
        hoverClass: {
          type: String,
          observer: '_hoverClassChange',
        },
        hoverStopPropagation: {
          type: Boolean,
          observer: '_hoverStopChange',
        },
      };
    }

    constructor() {
      super();
      this._hoverClass = [];
    }

    hasBehavior(type) {
      // simple mock of hasBehavior method
      if (type === 'hover') {
        return true;
      }

      if (super.hasBehavior) {
        return super.hasBehavior(type);
      }
    }

    bindHover() {
      if (!this._bindHover) {
        this._bindHover = true;
        this._hoverTouchStartId = this.hoverTouchStart.bind(this);
        this._hoverTouchEndId = this.hoverTouchEnd.bind(this);
        this._hoverCancelId = this.hoverCancel.bind(this);
        this.addEventListener('touchstart', this._hoverTouchStartId, PASSIVE_TOUCH);
        this.addEventListener('touchend', this._hoverTouchEndId);
        this.addEventListener('touchcancel', this._hoverCancelId);
        this.addEventListener('touchmove', this._hoverCancelId, PASSIVE_TOUCH);
      }
    }

    unbindHover() {
      if (this._bindHover) {
        this._bindHover = false;
        this.removeEventListener('touchstart', this._hoverTouchStartId);
        this.removeEventListener('touchend', this._hoverTouchEndId);
        this.removeEventListener('touchcancel', this._hoverCancelId);
        this.removeEventListener('touchmove', this._hoverCancelId);
      }
    }

    hoverTouchStart(e) {
      if (!e._hoverPropagationStopped) {
        if (this.hoverStopPropagation) {
          e._hoverPropagationStopped = true;
        }

        if (this._hoverTouch && e.touches.length > 1 && !this._hovering) {
          this.hoverCancel();
          return;
        }

        this._hoverTouch = true;

        if (this.hoverClass === 'none' || this.disabled) {
          return;
        }

        this._hoverStyleTimeId = setTimeout(() => {
          this._hovering = true;

          if (this._hoverClass.length > 0) {
            for (let e = 0; e < this._hoverClass.length; e++) {
              this.classList.toggle(this._hoverClass[e], true);
            }
          }

          if (!this._hoverTouch) {
            window.requestAnimationFrame(() => {
              clearTimeout(this._hoverStayTimeId);
              this._hoverStayTimeId = setTimeout(() => {
                this._hoverReset();
              }, this.hoverStayTime);
            });
          }
        }, this.hoverStartTime);
      }
    }

    hoverTouchEnd() {
      this._hoverTouch = false;

      if (this._hovering) {
        window.requestAnimationFrame(() => {
          clearTimeout(this._hoverStayTimeId);
          this._hoverStayTimeId = setTimeout(() => {
            this._hoverReset();
          }, this.hoverStayTime);
        });
      }
    }

    hoverCancel() {
      this._hoverTouch = false;
      clearTimeout(this._hoverStyleTimeId);

      this._hoverReset();
    }

    _hoverClassChange(targetClassName) {
      if (!targetClassName) {
        return;
      }

      const classes = targetClassName.split(/\s/);
      this._hoverClass = [];

      // remove hover effects
      if (targetClassName === 'none' && !this.hoverStopPropagation) {
        return this.unbindHover();
      }

      for (let n = 0; n < classes.length; n+=1) {
        classes[n] && this._hoverClass.push(classes[n]);
      }

      this.bindHover();
    }

    _hoverStopChange(e) {
      if (this.hoverClass === 'none' && !e) {
        return this.unbindHover();
      }

      this.bindHover();
    }

    _hoverReset() {
      if (this._hovering) {
        this._hovering = false;

        if (this.hoverClass !== 'none' && this._hoverClass.length > 0) {
          for (let e = 0; e < this._hoverClass.length; e++) {
            if (this.classList.contains(this._hoverClass[e])) {
              this.classList.toggle(this._hoverClass[e], false);
            }
          }
        }
      }
    }
  };
}
