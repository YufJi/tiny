import React, { useEffect, useState } from 'react'
import { pages, pageHref } from '../content/pages'

// Navigation is derived from the Markdown frontmatter (`name` + `order`), so
// adding a page never means editing this file.
const links = pages.map((page) => [page, pageHref(page), page.meta.name])
const footerLinks = links.filter(([page]) => page.route && page.route !== 'status')

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
          <a className="brand" href={pageHref(pages[0])}>
            <img
              className="brand-mark"
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt=""
              width="46"
              height="46"
            />
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
            {links.map(([page, href, label]) => (
              <a key={page.route} href={href} aria-current={route === page.route ? 'page' : undefined}>
                {label}
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
            {footerLinks.map(([page, href, label]) => (
              <a key={page.route} href={href}>{label}</a>
            ))}
            <a href="https://github.com/YufJi/tiny">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  )
}
