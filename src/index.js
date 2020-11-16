import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import './scss/style.scss'

const rootElement = document.getElementById('root')
ReactDOM.render(<App width={rootElement.offsetWidth} height={document.documentElement.clientHeight} />, rootElement)
