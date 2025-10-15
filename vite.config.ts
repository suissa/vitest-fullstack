import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-fastify-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next()
          const apiPath = req.url.replace('/api/', '')
          const filePath = path.resolve(`src/api/${apiPath}.ts`)
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'route not found' }))
            return
          }
          const mod = await import(filePath + '?t=' + Date.now())
          const handler = mod.default
          const chunks: Buffer[] = []
          req.on('data', c => chunks.push(c))
          req.on('end', async () => {
            const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
            const result = await handler({ req, body })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          })
        })
      }
    }
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
