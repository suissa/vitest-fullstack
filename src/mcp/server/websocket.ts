import { WebSocketServer, WebSocket } from "ws"
import { EventEmitter } from "events"

const eventBus = new EventEmitter()

interface Client {
  socket: WebSocket
  id: string
}

const clients: Client[] = []

/**
 * Cria o servidor WebSocket para broadcast em tempo real
 */
export function createWebSocketServer(port = 5051) {
  const wss = new WebSocketServer({ port })
  console.log(`🔮 MCP WebSocket rodando em ws://localhost:${port}`)

  wss.on("connection", (socket) => {
    const id = Math.random().toString(36).substring(2, 10)
    clients.push({ socket, id })
    console.log(`🧩 Cliente conectado: ${id}`)

    socket.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString())
        if (data.type === "ping") socket.send(JSON.stringify({ type: "pong" }))
        if (data.type === "subscribe") eventBus.emit("subscribe", { id, ...data })
      } catch (err) {
        console.error("❌ Erro ao processar mensagem:", err)
      }
    })

    socket.on("close", () => {
      const index = clients.findIndex((c) => c.id === id)
      if (index !== -1) clients.splice(index, 1)
      console.log(`❌ Cliente desconectado: ${id}`)
    })
  })

  // Envia eventos para todos os clientes conectados
  eventBus.on("broadcast", (event) => {
    for (const { socket } of clients) {
      if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(event))
    }
  })

  return { wss, eventBus }
}

/**
 * Envia uma atualização para o dashboard e agentes conectados
 */
export function broadcastEvent(type: string, payload: any) {
  eventBus.emit("broadcast", { type, payload, timestamp: Date.now() })
}
