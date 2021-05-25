import { prefix } from '@/utils/config';

export default function Data(superClass) {
  return class extends superClass {
    static get properties() {
      return {
        name: {
          type: String,
        },
      };
    }

    getFormData(fn) {
      fn(this.value || '');
    }

    resetFormData() {
      // will be overwritten by subClass
    }

    hasBehavior(type) {
      if (type === `${prefix}-data`) {
        return true;
      }

      return _superClass.prototype.hasBehavior.call(this, type);
    }
  };
}
