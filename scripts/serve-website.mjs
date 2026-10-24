import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../website')
const port = Number(process.env.PORT ?? 4173)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = path.resolve(rootDir, relative)
  if (!file.startsWith(rootDir + path.sep) && file !== rootDir) {
    response.writeHead(403).end('Forbidden')
    return
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404).end('Not found')
      return
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' })
    response.end(data)
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Tiny website: http://127.0.0.1:${port}/`)
})
