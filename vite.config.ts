import { defineConfig } from "vite"
import fs from "fs"
import path from "path"

export default defineConfig({
  plugins: [
    {
      name: "vite-api-fetch",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/api/")) return next()

          try {
            const apiPath = req.url.replace(/^\/api\//, "")
            const [route, query] = apiPath.split("?")
            const filePath = path.resolve(`src/api/${route}.ts`)

            if (!fs.existsSync(filePath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: "Not found" }))
              return
            }

            const mod = await import(filePath + `?t=${Date.now()}`) // for hot reload
            const handler = mod.default

            if (typeof handler !== "function") {
              res.statusCode = 500
              res.end(JSON.stringify({ error: "Invalid handler" }))
              return
            }

            // Recria Request padrão
            const url = new URL(req.url!, `http://${req.headers.host}`)
            const chunks: Buffer[] = []
            req.on("data", (c) => chunks.push(c))
            req.on("end", async () => {
              const body = chunks.length ? Buffer.concat(chunks) : undefined
              const request = new Request(url, {
                method: req.method,
                headers: req.headers as any,
                body: body ? body.toString() : undefined,
              })

              const response = await handler(request)
              const headers = Object.fromEntries(response.headers.entries())
              res.writeHead(response.status, headers)
              const data = await response.arrayBuffer()
              res.end(Buffer.from(data))
            })
          } catch (err: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      },
    },
  ],
})
