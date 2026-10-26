import React, { useEffect, useState } from 'react'

const links = [
  ['home', '#/'],
  ['architecture', '#/architecture'],
  ['compiler', '#/compiler'],
  ['runtime', '#/runtime'],
  ['protocol', '#/protocol'],
  ['hosts', '#/hosts'],
  ['devtool', '#/devtool'],
  ['testing', '#/testing'],
  ['status', '#/status'],
]

const labels = {
  home: '概览',
  architecture: '架构',
  compiler: '编译',
  runtime: '运行时',
  protocol: '协议',
  hosts: '宿主',
  devtool: '调试器',
  testing: '测试',
  status: '现状',
}

export default function Layout({ route, children }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [route])

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        跳到正文
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="#/">
            <span className="brand-mark" aria-hidden="true">T</span>
            <span className="brand-copy"><strong>Tiny</strong><small>mini-program engine</small></span>
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-label="打开导航"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            ☰
          </button>
          <nav className={`site-nav${open ? ' open' : ''}`} aria-label="主导航">
            {links.map(([key, href]) => (
              <a key={key} href={href} aria-current={route === key ? 'page' : undefined}>
                {labels[key]}
              </a>
            ))}
            <a className="nav-github" href="https://github.com/YufJi/tiny">GitHub ↗</a>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>{children}</main>

      <footer>
        <div className="shell footer-inner">
          <span>Tiny · 小程序引擎 · MIT</span>
          <div className="footer-links">
            <a href="#/architecture">架构</a>
            <a href="#/compiler">编译</a>
            <a href="#/runtime">运行时</a>
            <a href="#/protocol">协议</a>
            <a href="#/hosts">宿主</a>
            <a href="#/devtool">调试器</a>
            <a href="#/testing">测试</a>
            <a href="https://github.com/YufJi/tiny">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  )
}
