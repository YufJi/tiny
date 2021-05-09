import Nerv, { createNervClass } from '@/nerv';
import { createComponent } from '@/framework/';
import Checkbox from '../shared/Checkbox';

const Radio = createComponent({
  name: 'radio',
  pure: false,
})(createNervClass({
  displayName: 'Radio',
  // no formMixin, manage value by checkbox-group
  statics: {
    isFormControl: 1,
  },
  getDefaultProps() {
    return {
      checked: false,
      disabled: false,
      value: '',
    };
  },

  getInitialState() {
    const state = {
      checked: !!this.props.checked,
    };
    const { context } = this;
    const { radioGroup } = context;

    if (radioGroup) {
      radioGroup.radioListeners.push(this.onGroupNotify);
      if (state.checked) {
        radioGroup.updateValue(this.props.value);
      }
    }
    return state;
  },

  componentDidUpdate(prevProps) {
    const { context } = this;
    const { radioGroup } = context;

    if (radioGroup) {
      if (radioGroup.isResetting) {
        this.setState({
          checked: this.props.value === radioGroup.state.value,
        });
        return;
      }
    }
    if (this.props.checked !== prevProps.checked) {
      this.setState({
        checked: this.props.checked,
      });
      if (radioGroup && this.props.checked) {
        radioGroup.updateValue(this.props.value);
      }
    }
  },
  componentWillUnmount() {
    const { context } = this;
    const { radioGroup } = context;

    if (radioGroup) {
      const index = radioGroup.radioListeners.indexOf(this.onGroupNotify);
      if (index !== -1) {
        radioGroup.radioListeners.splice(index, 1);
      }
    }
  },
  onGroupNotify() {
    const { context } = this;
    const { radioGroup } = context;

    const shouldChecked = this.props.value === radioGroup.state.value;
    if (shouldChecked !== this.state.checked) {
      this.setState({
        checked: shouldChecked,
      });
    }
  },
  onClick() {
    if (!this.state.checked && !this.props.disabled) {
      this.onChange({
        target: {
          checked: true,
        },
      });
    }
  },
  onChange(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    const { checked } = e.target;

    if (checked) {
      this.setState({
        checked: e.target.checked,
      });
      const { context } = this;
      if (context.radioGroup) {
        context.radioGroup.onChange({
          detail: {
            value: this.props.value,
            checked,
          },
        });
      }
    }
  },
  render() {
    const { disabled, className = '', id, style, color } = this.props;
    const { checked } = this.state;

    return (
      <Checkbox
        id={id}
        type="radio"
        prefixCls="a-radio"
        style={style}
        className={className}
        checked={checked}
        disabled={disabled}
        onChange={this.onChange}
        color={color}
      />
    );
  },
}));

export default Radio;
