export default function LabelTarget(superClass) {
  return class extends superClass {
    get isLabelTarget() {
      return true;
    }

    handleLabelTap(e) {
      // do nothing
    }
  };
}
