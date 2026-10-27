import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { routeFromPath } from './content/site'
import './styles.css'

const container = document.getElementById('root')
const app = <App route={routeFromPath(window.location.pathname)} />

// Production pages arrive prerendered and are hydrated; the dev server serves
// an empty shell, so it needs a plain render.
if (container.firstChild) ReactDOM.hydrate(app, container)
else ReactDOM.render(app, container)
