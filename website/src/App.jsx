import React, { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Architecture from './pages/Architecture'
import Compiler from './pages/Compiler'
import Runtime from './pages/Runtime'
import Protocol from './pages/Protocol'
import Hosts from './pages/Hosts'
import Devtool from './pages/Devtool'
import Testing from './pages/Testing'
import Status from './pages/Status'

const routes = {
  home: Home,
  architecture: Architecture,
  compiler: Compiler,
  runtime: Runtime,
  protocol: Protocol,
  hosts: Hosts,
  devtool: Devtool,
  testing: Testing,
  status: Status,
}

// Keep the pre-expansion URL working.
const aliases = {
  internals: 'architecture',
}

const titles = {
  home: 'Tiny · 小程序引擎架构',
  architecture: '架构 · Tiny',
  compiler: '编译流程 · Tiny',
  runtime: '运行时 · Tiny',
  protocol: 'Bridge 协议 · Tiny',
  hosts: '宿主适配 · Tiny',
  devtool: '在线调试器 · Tiny',
  testing: '测试与验收 · Tiny',
  status: '现状 · Tiny',
}

const readRoute = () => {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const value = aliases[raw] ?? raw
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
