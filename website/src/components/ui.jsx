import React, { useState } from 'react'

export function PageHero({ eyebrow, title, lede, stats = [], pills = [] }) {
  return (
    <section className="page-hero">
      <div className="shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
        {stats.length > 0 ? (
          <div className="stat-strip">
            {stats.map(([value, label]) => <span key={label}><strong>{value}</strong> {label}</span>)}
          </div>
        ) : null}
        {pills.length > 0 ? (
          <div className="pill-row">
            {pills.map(([label, tone]) => <Pill key={label} tone={tone}>{label}</Pill>)}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function Section({ kicker, title, intro, link, children }) {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            {kicker ? <p className="kicker">{kicker}</p> : null}
            <h2>{title}</h2>
            {intro ? <p className="section-intro">{intro}</p> : null}
          </div>
          {link ? <a className="section-link" href={link[1]}>{link[0]}</a> : null}
        </div>
        {children}
      </div>
    </section>
  )
}

export function Flow({ nodes }) {
  return (
    <div className="panel flow" aria-label="架构流程">
      {nodes.map((node, index) => (
        <React.Fragment key={node.title}>
          {index > 0 ? <div className="flow-arrow" aria-hidden="true">→</div> : null}
          <div className={`flow-node${node.accent ? ' accent' : ''}`}>
            <span className="step">{node.step}</span>
            <strong>{node.title}</strong>
            <code>{node.detail}</code>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export function Cards({ children, className = '' }) {
  return <div className={`cards ${className}`.trim()}>{children}</div>
}

export function Card({ tag, tone, title, children }) {
  return (
    <article className="card">
      {tag ? <span className={`tag${tone ? ` ${tone}` : ''}`}>{tag}</span> : null}
      {title ? <h3>{title}</h3> : null}
      {children}
    </article>
  )
}

export function Callout({ title, children }) {
  return (
    <div className="callout">
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  )
}

export function Table({ head, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{head.map((cell) => <th key={String(cell)}>{cell}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CodeBlock({ children }) {
  const [copied, setCopied] = useState('')
  const text = String(children).trim()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied('已复制')
      setTimeout(() => setCopied(''), 1400)
    } catch {
      setCopied('复制失败')
    }
  }

  return (
    <pre>
      <code>{children}</code>
      <button className="copy-code" type="button" onClick={copy}>{copied || '复制'}</button>
    </pre>
  )
}

export function Pill({ tone, children }) {
  return <span className={`pill${tone ? ` ${tone}` : ''}`}>{children}</span>
}

export function PillRow({ children }) {
  return <div className="pill-row">{children}</div>
}
