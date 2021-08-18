/* eslint-disable max-classes-per-file */
/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:35:52
 * @LastEditTime: 2021-07-13 12:00:50
 * @Description:
 * @FilePath: /yeact/src/create-context.js
 */
import { isUndefined, objectIs } from './utils';
import Emitter from './emitter';
import Component from './component';

export let uid = 0;

function onlyChild(children) {
  return Array.isArray(children) ? children[0] : children;
}

export function createContext(defaultValue) {
  const contextProp = `__context_${uid++}__`;

  class Provider extends Component {
    static isContextProvider = true

    emitter = new Emitter(this.props.value)

    getChildContext() {
      return {
        [contextProp]: this.emitter,
      };
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillReceiveProps(nextProps) {
      if (!objectIs(this.props.value, nextProps.value)) {
        this.emitter.set(nextProps.value);
      }
    }

    render() {
      return this.props.children;
    }
  }

  // tslint:disable-next-line: max-classes-per-file
  class Consumer extends Component {
    static isContextConsumer = true

    state = {
      value: this.getContextValue(),
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillMount() {
      const emitter = this.context[contextProp];
      if (emitter) {
        emitter.off(this.onUpdate);
      }
    }

    componentDidMount() {
      const emitter = this.context[contextProp];
      if (emitter) {
        emitter.on(this.onUpdate);
      }
    }

    onUpdate = (value) => {
      if (!objectIs(value, this.state.value)) {
        this.setState({
          value: this.getContextValue(),
        });
      }
    }

    getContextValue() {
      const emitter = this.context[contextProp];
      return isUndefined(emitter) ? defaultValue : emitter.value;
    }

    render() {
      return onlyChild(this.props.children)(this.state.value);
    }
  }

  return {
    Provider,
    Consumer,
    _id: contextProp,
    _defaultValue: defaultValue,
  };
}
