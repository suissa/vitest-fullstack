import { useEffect, useState } from "react"

export function useMCPWebSocket() {
  const [events, setEvents] = useState<any[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5051")
    ws.onopen = () => console.log("🛰️ Conectado ao MCP WS")
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        setEvents((prev) => [data, ...prev])
      } catch (e) {
        console.error("Erro ao parsear WS:", e)
      }
    }
    ws.onclose = () => console.log("❌ WS fechado")
    setSocket(ws)
    return () => ws.close()
  }, [])

  return { socket, events }
}
