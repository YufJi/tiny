
import React from 'react';
import createReactClass from 'create-react-class';
import throttle from '@/utils/throttle';
import formMixin from '../form/mixin';
import callBridge from '@/utils/callBridge';
import { createComponent } from '@/framework/';

function addComa(s) {
  const m = s && s.match(/:/g);
  if (m && m.length === 1) {
    return `${s}:00`;
  }
  return s;
}
function normalizeDate(s2) {
  // .replace(/\//g, '-');
  const s = s2;
  const m = s && s.match(/:/g);
  if (m && m.length === 2) {
    return s.slice(0, s.lastIndexOf(':'));
  }
  return s;
}
const Picker = createComponent({
  pure: false,
  name: 'picker',
})(createReactClass({
  displayName: 'Picker',
  mixins: [formMixin],
  getDefaultProps: function getDefaultProps() {
    return {
      mode: 'selector',
      fields: 'day',
      disabled: false,
    };
  },
  componentDidMount: function componentDidMount() {
    this.onPickerTap = throttle(this.onPickerTap, 500, {
      trailing: false,
    });
    this.onDateTap = throttle(this.onDateTap, 500, {
      trailing: false,
    });
  },
  onPickerTap: function onPickerTap() {
    const _this = this;
    const { title, range = [], rangeKey, onChange} = this.props;

    let showList = range;
    if (rangeKey && typeof range[0] === 'object') {
      showList = range.map((o) => {
        return o[rangeKey];
      });
    }
    const optionsPicker = 'beehiveOptionsPicker';
    // 此API是从高德小程序开始使用，后续其他MPASS客户端升级框架时需要确保对应的JSAPI已经可用。
    if (false) {

    }
    let index = parseInt(this.state.value, 10) || 0;
    index = index < 0 ? 0 : index;
    callBridge(optionsPicker, {
      title,
      optionsOne: showList,
      selectedOneIndex: index,
    }, (result) => {
      if (typeof result.selectedOneIndex === 'number' && onChange) {
        onChange(_this.props.$mp.getNormalizedEvent('change', {
          detail: { value: result.selectedOneIndex },
        }));
      }
    });
  },
  onDateTap: function onDateTap() {
    const _this = this;
    const { start, end, onChange, mode, fields } =  this.props;


    let pMode = 1;
    if (mode === 'time') {
      pMode = 0;
    } else if (mode === 'date') {
      const MODE = {
        day: 1,
        month: 3,
        year: 4,
      };
      pMode = MODE[fields];
    }
    callBridge('datePicker', {
      beginDate: addComa(this.state.value),
      minDate: start,
      maxDate: end,
      mode: pMode,
    }, (e) => {
      if (e.date && onChange) {
        onChange(_this.props.$mp.getNormalizedEvent('change', {
          detail: { value: normalizeDate(e.date) },
        }));
      }
    });
  },
  render: function render() {
    const { props } = this;
    const { children } = props;
    const { disabled } = props;
    const { mode } = props;

    if (disabled) {
      return children;
    }
    return React.cloneElement(children, {
      onTap: mode === 'selector' ? this.onPickerTap : this.onDateTap,
    });
  },
}));

export default Picker;
