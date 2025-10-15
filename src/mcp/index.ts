import { createRestServer } from "./server/rest"
import { createWebSocketServer } from "./server/websocket"
import { createStdioServer } from "./server/stdio"
import { MCPServer } from "@modelcontextprotocol/sdk"
import { runTest } from "./actions/runTest"
import { editWithLLM } from "./actions/editWithLLM"
import { getCoverage } from "./actions/getCoverage"
import { autoHealLoop } from "../autoheal/engine"
import { getFullMemory } from "../memory/memoryHub"

export async function startMCP() {
  // Inicializa REST + WS
  await createRestServer()
  const { eventBus } = createWebSocketServer()

  // Inicializa STDIO server
  createStdioServer()

  // Inicializa MCP Server padrão (SDK oficial)
  const server = new MCPServer({
    name: "ViteAPI-MCP",
    version: "1.0.0",
  })

  // Registra ações padrão
  server.action("run", async (ctx) => runTest(ctx.input.file, ctx.input.type))
  server.action("edit", async (ctx) => editWithLLM(ctx.input.file, ctx.input.prompt))
  server.action("coverage", async () => getCoverage())
  server.action("autoheal", async (ctx) => autoHealLoop(ctx.input.file, ctx.input.error))
  server.action("memory", async () => getFullMemory())

  // Listener STDIO oficial
  server.listen({ stdio: true })

  console.log("🚀 MCP Server completo rodando (REST + WS + STDIO)")
}
