import React, { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from '../../docs/site/home.md'
import Architecture from '../../docs/site/architecture.md'
import Compiler from '../../docs/site/compiler.md'
import Runtime from '../../docs/site/runtime.md'
import Protocol from '../../docs/site/protocol.md'
import Hosts from '../../docs/site/hosts.md'
import Devtool from '../../docs/site/devtool.md'
import Testing from '../../docs/site/testing.md'
import Status from '../../docs/site/status.md'

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
