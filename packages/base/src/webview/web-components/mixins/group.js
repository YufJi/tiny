import { TemplateTag } from 'shared';

export default function Group(superClass) {
  return class extends superClass {
    ready() {
      super.ready();

      this.addEventListener('itemValueChanged', this._handleItemValueChanged);
      this.addEventListener('itemAdded', this._handleItemAdded);
      this.addEventListener('itemCheckedChanged', this._handleItemCheckedChanged);
      this.addEventListener('itemRemoved', this._handleItemRemoved);
      this.addEventListener('itemChangedByTap', this._handleChangedByTap);
    }

    _handleItemValueChanged(e) {
      this.renameItem(e.detail.item, e.detail.newVal, e.detail.oldVal);
    }

    _handleItemCheckedChanged(e) {
      this.changed(e.detail.item);
    }

    _handleItemAdded(e) {
      if (!e.detail.item._relatedGroup) {
        e.detail.item._relatedGroup = this;
        this.addItem(e.detail.item);
      }

      return false;
    }

    _handleItemRemoved(e) {
      this.removeItem(e.detail.item);
      return false;
    }

    _handleChangedByTap() {
      this.triggerEvent('change', {
        value: this.value,
      });
    }

    resetFormData() {
      if (this.hasBehavior(`${TemplateTag.LowerCasePrefix}-data`)) {
        !(function dfs(t) {
          t.childNodes && Array.from(t.childNodes).forEach((t) => {
            if (t.hasBehavior) {
              if (t.hasBehavior(`${TemplateTag.LowerCasePrefix}-group`)) {
                return;
              }

              if (t.hasBehavior(`${TemplateTag.LowerCasePrefix}-item`)) {
                return t.resetFormData();
              }
            }

            dfs(t);
          });
        })(this);
      }
    }

    addItem() {
      /* 子类实现 */
    }

    removeItem() {
      /* 子类实现 */
    }

    renameItem() {
      /* 子类实现 */
    }

    changed() {
      /* 子类实现 */
    }

    hasBehavior(type) {
      if (type === `${TemplateTag.LowerCasePrefix}-group`) {
        return true;
      }

      return super.hasBehavior(type);
    }
  };
}
