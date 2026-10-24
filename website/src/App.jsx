import React, { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Internals from './pages/Internals'
import Testing from './pages/Testing'
import Status from './pages/Status'

const routes = {
  home: Home,
  internals: Internals,
  testing: Testing,
  status: Status,
}

const titles = {
  home: 'Tiny · 小程序引擎架构',
  internals: '内部分层 · Tiny',
  testing: '测试与兼容 · Tiny',
  status: '现状与路线 · Tiny',
}

const readRoute = () => {
  const value = window.location.hash.replace(/^#\/?/, '')
  return routes[value] ? value : 'home'
}

export default function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = titles[route]
  }, [route])

  const Page = routes[route]
  return (
    <Layout route={route}>
      <Page />
    </Layout>
  )
}
