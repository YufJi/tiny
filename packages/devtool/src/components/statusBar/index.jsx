import React from 'react';
import Battery from './battery';
import Timer from './timer';
// eslint-disable-next-line no-unused-vars
import './styles.less';

const StatusBar = () => (
    <div className="statusBar">
        <Timer />
        <Battery />
    </div>
);
export default StatusBar;
