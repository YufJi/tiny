import React from 'react';
import Timer from './timer';
// eslint-disable-next-line no-unused-vars
import './styles.less';

const StatusBar = () => (
  <div className="statusBar">
    <Timer />
    <div className="status-info">
      <i className="ic item">&#xe956;</i>
      <i className="ic item">&#xe9fc;</i>
      <i className="ic item">&#xe614;</i>
    </div>
  </div>
);
export default StatusBar;
