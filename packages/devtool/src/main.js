import React from 'react';
import ReactDOM from 'react-dom';

import jsbridge from '@/utils/jsbridge'

import App from './app'
import 'normalize.css'
import './global.css'

window.JSBridgeInstance = jsbridge;

ReactDOM.render(<App />, document.getElementById('root'))
