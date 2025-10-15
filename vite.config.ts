import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

// Função utilitária pra recarregar módulos da API no runtime
async function importFresh(filePath: string) {
  const resolved = path.resolve(filePath)
  const timestamp = `?update=${Date.now()}` // força reload a cada requisição
  return import(resolved + timestamp)
}

// Plugin principal: Atomic Behavior Routes (ABR)
function AtomicBehaviorRoutes() {
  return {
    name: "vite-atomic-behavior-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next()

        const apiPath = req.url.replace(/^\/api\//, "")
        const [route] = apiPath.split("?")
        const filePathTS = path.resolve(`src/api/${route}.ts`)
        const filePathJS = path.resolve(`src/api/${route}.js`)
        const filePath =
          fs.existsSync(filePathTS) ? filePathTS : fs.existsSync(filePathJS) ? filePathJS : null

        if (!filePath) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "API route not found" }))
          return
        }

        try {
          const mod = await importFresh(filePath)
          const handler = mod.default

          if (typeof handler !== "function") {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Invalid API handler" }))
            return
          }

          // Monta Request Fetch API
          const url = new URL(req.url, `http://${req.headers.host}`)
          const chunks: Buffer[] = []

          req.on("data", (chunk) => chunks.push(chunk))
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
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
      })
    },
  }
}

// Configuração principal do Vite
export default defineConfig({
  plugins: [react(), AtomicBehaviorRoutes()],
  server: {
    port: parseInt(process.env.DASHBOARD_PORT || "11911"),
    proxy: {
      // Proxy interno para API ABR
      "/api": `http://localhost:${process.env.APP_PORT || 12921}`,
    },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/data/**"],
    },
  },
  build: {
    outDir: "dist",
  },
})
