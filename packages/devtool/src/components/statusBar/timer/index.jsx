import React, { Component } from 'react';
import './styles.less';

function format(date) {
  return `${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}`;
}
class Clock extends Component {
  constructor(props) {
    super(props);
    const date = new Date();
    this.state = {
      time: format(date),
    };
    this.updateTime();
  }

    updateTime = () => {
      setTimeout(() => {
        const date = new Date();
        this.setState({
          time: format(date),
        });
        this.updateTime();
      }, 5000);
    }

    render() {
      const { time } = this.state;
      return <div className="clock">{time}</div>;
    }
}
export default Clock;
