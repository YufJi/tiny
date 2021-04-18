
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { createComponent } from '@/framework/';
import callInternalAPI from '@/utils/callInternalAPI';
import objectKeys from '@/utils/objectKeys';

const Form = createComponent({
  pure: false,
  name: 'form',
})(createReactClass({
  displayName: 'Form',
  childContextTypes: {
    form: PropTypes.any,
  },
  getChildContext: function getChildContext() {
    return {
      form: this,
    };
  },
  getInitialState: function getInitialState() {
    this.fieldsValue = {};
    this.fields = {};
    return {};
  },
  registerField: function registerField(name, inst) {
    this.fields[name] = inst;
  },

  // called by switch/checkbox/...
  setFieldValue: function setFieldValue(name, value) {
    this.fieldsValue[name] = value;
  },
  removeField: function removeField(name) {
    delete this.fieldsValue[name];
    delete this.fields[name];
  },
  _onSubmit: function _onSubmit(buttonDataset, formId, receiverFormId) {
    const detail = {
      value: this.fieldsValue,
    };
    if (formId) {
      detail.formId = formId;
    }
    if (receiverFormId) {
      detail.receiverFormId = receiverFormId;
    }
    const event = this.props.$mp.getNormalizedEvent('submit', {
      detail,
      buttonTarget: {
        dataset: buttonDataset || {},
      },
    });
    this.props.onSubmit(event);
  },

  // called by button
  submit: function submit(buttonDataset) {
    const _this = this;

    const _props = this.props;
    const { onSubmit } = _props;
    const { reportSubmit } = _props;
    const { receiverUserId } = _props;

    if (onSubmit) {
      if (reportSubmit) {
        const apiParams = {};
        if (receiverUserId) {
          apiParams.receiverUserId = receiverUserId;
        }
        callInternalAPI('requestTemplateData', apiParams, (result) => {
          _this._onSubmit(buttonDataset, result.formId, result.receiverFormId);
        });
      } else {
        this._onSubmit(buttonDataset);
      }
    }
  },

  // called by button
  reset: function reset() {
    const _this2 = this;

    objectKeys(this.fields).forEach((name) => {
      _this2.fields[name].reset();
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  },
  render: function render() {
    const { className, style, id, children } = this.props;

    return (
      <div className={className} style={style} id={id} role="form">
        {children}
      </div>
    );
  },
}));

export default Form;
