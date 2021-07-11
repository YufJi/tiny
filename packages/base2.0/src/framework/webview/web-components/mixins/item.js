import { elementPrefix } from '@utils/config';

export default function Item(superClass) {
  return class extends superClass {
    static get properties() {
      return {
        value: {
          type: String,
          observer: 'valueChange',
        },
        checked: {
          type: Boolean,
          value: false,
          observer: 'checkedChange',
        },
      };
    }

    hasBehavior(type) {
      if (type === `${elementPrefix}-item`) {
        return true;
      }

      return super.hasBehavior(type);
    }

    connectedCallback() {
      super.connectedCallback();

      this.dispatchEvent(new CustomEvent('itemAdded', {
        detail: {
          item: this,
        },
        bubbles: true,
      }));
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._relatedGroup) {
        this._relatedGroup.dispatchEvent(new CustomEvent('itemRemoved', {
          detail: {
            item: this,
          },
        }));

        this._relatedGroup = null;
      }
    }

    moved() {
      if (this._relatedGroup) {
        this._relatedGroup.dispatchEvent(new CustomEvent('itemRemoved'));

        this._relatedGroup = null;
      }

      this.dispatchEvent(new CustomEvent('itemAdded', {
        detail: {
          item: this,
        },
        bubbles: true,
      }));
    }

    valueChange(newVal, oldVal) {
      if (this._relatedGroup) {
        this._relatedGroup.dispatchEvent(new CustomEvent('itemValueChanged', {
          detail: {
            item: this,
            newVal,
            oldVal,
          },
        }));
      }
    }

    checkedChange(newValue, oldValue) {
      if (typeof oldValue !== 'undefined' && newValue !== oldValue && this._relatedGroup) {
        this._relatedGroup.dispatchEvent(new CustomEvent('itemCheckedChanged', {
          detail: {
            item: this,
          },
        }));
      }
    }

    changedByTap() {
      if (this._relatedGroup) {
        this._relatedGroup.dispatchEvent(new CustomEvent('itemChangedByTap'));
      }
    }

    resetFormData() {
      this.checked = false;
    }
  };
}
