import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    {
      name: 'vite-api-routes',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next()

          const apiPath = req.url.replace('/api/', '')
          const filePath = path.resolve(`src/api/${apiPath}.ts`)

          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'API route not found' }))
            return
          }

          // Importação dinâmica do módulo da API
          const mod = await import(filePath)
          const handler = mod.default

          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Invalid API handler' }))
            return
          }

          // Parâmetros simples
          const chunks: Buffer[] = []
          req.on('data', chunk => chunks.push(chunk))
          req.on('end', async () => {
            const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
            const result = await handler({ req, body })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          })
        })
      },
    },
  ],
})
