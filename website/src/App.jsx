import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { pages, pageTitle, routes } from './content/pages'

export default function App({ route }) {
  const page = routes[route] ?? pages[0]

  useEffect(() => {
    document.title = pageTitle(page)
  }, [page])

  const Page = page.Component
  return (
    <Layout route={page.route}>
      <Page />
    </Layout>
  )
}
