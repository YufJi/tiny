
import PropTypes from 'prop-types';

let index = 0;
function getImmutableValue(value2) {
  let value = value2;
  if (Array.isArray(value)) {
    value = value.concat();
  }
  return value;
}
function getValueFromProps(props) {
  return props[props.valueProp || 'value'];
}

export default ({
  contextTypes: {
    form: PropTypes.any,
  },
  statics: {
    isFormControl: true,
  },
  getInitialState: function getInitialState() {
    const { props } = this;

    let value = getValueFromProps(props);
    if (value === true && props.$mp.tagName === 'input') {
      value = '';
    }
    this.name = this.props.name || `__unknown_for_control_${++index}`;
    return {
      value,
    };
  },
  getCurrentValue: function getCurrentValue() {
    if (this.props.controlled) {
      return getValueFromProps(this.props);
    }
    return this.state.value;
  },
  componentDidMount: function componentDidMount() {
    if (this.context.form) {
      const value = this.getCurrentValue();
      this.initialValue = getImmutableValue(value);
      this.context.form.registerField(this.name, this);
      this.context.form.setFieldValue(this.name, value);
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.props.controlled) {
      return;
    }
    if (getValueFromProps(nextProps) !== getValueFromProps(this.props)) {
      this.setState({
        value: getValueFromProps(nextProps),
      });
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    this.updateFormValue();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.context.form) {
      this.context.form.removeField(this.name);
    }
  },
  updateFormValue: function updateFormValue() {
    if (this.context.form) {
      this.context.form.setFieldValue(this.name, this.getCurrentValue());
    }
  },
  reset: function reset() {
    const _this = this;

    if (this.props.controlled) {
      return;
    }
    this.isResetting = true;
    this.setState({
      value: getImmutableValue(this.initialValue),
    }, () => {
      _this.isResetting = false;
    });
  },
});
