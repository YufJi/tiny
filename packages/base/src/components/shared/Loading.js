
import React from 'react';
import classnames from 'classnames';

const prefix = 'a-loading';

class Loading extends React.PureComponent {
  render() {
    const wrapCls = classnames({
      [`${prefix}-indicator`]: true,
      white: this.props.mode === 'white',
    });
    return (
      <div
        className={wrapCls}
        aria-hidden
      >
        <div className={`${prefix}-item`} />
        <div className={`${prefix}-item`} />
        <div className={`${prefix}-item`} />
      </div>
    );
  }
}

export default Loading;
