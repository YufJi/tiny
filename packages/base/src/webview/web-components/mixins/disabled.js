export default function Disabled(superClass) {
  return class extends superClass {
    static get properties() {
      return {
        disabled: {
          type: Boolean,
          value: false,
        },
      };
    }
  };
}
