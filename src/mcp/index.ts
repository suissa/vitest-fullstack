import { WebSocketServer } from "ws"
import { randomUUID } from "crypto"
import { createServer } from "http"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

// === CONFIG ===
const REST_PORT = parseInt(process.env.MCP_REST_PORT || "15951")
const WS_PORT = parseInt(process.env.MCP_WS_PORT || "14941")

// === HANDLER MAP ===
const actionsDir = path.resolve("src/mcp/actions")
const getActions = () =>
  fs
    .readdirSync(actionsDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .map((f) => ({
      name: f.replace(/\.(ts|js)$/, ""),
      action: import(path.resolve(actionsDir, f) + `?t=${Date.now()}`),
    }))

// === REST SERVER ===
createServer(async (req, res) => {
  if (!req.url?.startsWith("/api/mcp/rest")) {
    res.statusCode = 404
    return res.end("Not Found")
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const actionName = url.searchParams.get("action")
    const actions = await Promise.all(await getActions())

    const act = actions.find((a) => a.name === actionName)
    if (!act) throw new Error(`Action '${actionName}' not found`)

    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", async () => {
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
      const mod = await act.action
      const result = await mod.default(body)
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ ok: true, result }))
    })
  } catch (err: any) {
    res.statusCode = 500
    res.end(JSON.stringify({ ok: false, error: err.message }))
  }
}).listen(REST_PORT, () => {
  console.log(`⚙️ MCP REST ativo em http://localhost:${REST_PORT}/api/mcp/rest`)
})

// === WEBSOCKET SERVER ===
const wss = new WebSocketServer({ port: WS_PORT })
wss.on("connection", (socket) => {
  console.log("🔗 Conexão WS MCP aberta")
  socket.on("message", async (data) => {
    try {
      const { action, payload } = JSON.parse(data.toString())
      const actions = await Promise.all(await getActions())
      const act = actions.find((a) => a.name === action)
      if (!act) throw new Error(`Action '${action}' not found`)
      const mod = await act.action
      const result = await mod.default(payload)
      socket.send(JSON.stringify({ id: randomUUID(), result }))
    } catch (err: any) {
      socket.send(JSON.stringify({ error: err.message }))
    }
  })
})
console.log(`📡 MCP WS ativo em ws://localhost:${WS_PORT}`)

// === STDIO SIMULADO (CLI MODE) ===
process.stdin.on("data", async (input) => {
  const text = input.toString().trim()
  if (!text) return
  const [actionName, ...args] = text.split(" ")
  const actions = await Promise.all(await getActions())
  const act = actions.find((a) => a.name === actionName)
  if (!act) return console.error("❌ Ação não encontrada:", actionName)
  const mod = await act.action
  const payload = args.length ? JSON.parse(args.join(" ")) : {}
  const result = await mod.default(payload)
  console.log("✅ Resultado:", JSON.stringify(result, null, 2))
})
