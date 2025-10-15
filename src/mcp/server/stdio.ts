import { createInterface } from "readline"
import { EventEmitter } from "events"
import { runTest } from "../actions/runTest"
import { editWithLLM } from "../actions/editWithLLM"
import { getCoverage } from "../actions/getCoverage"
import { autoHealLoop } from "../../autoheal/engine"
import { getFullMemory } from "../../memory/memoryHub"

/**
 * Servidor MCP via STDIO (para agentes e CLIs locais)
 * Usa entrada e saída padrão para comunicação com MCPClient
 */
export function createStdioServer() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  const events = new EventEmitter()
  console.log("🧩 MCP STDIO Server iniciado (aguardando comandos JSON)")

  rl.on("line", async (line) => {
    try {
      const { action, payload } = JSON.parse(line)

      switch (action) {
        case "run":
          return respond(await runTest(payload.file, payload.type))
        case "edit":
          return respond(await editWithLLM(payload.file, payload.prompt))
        case "coverage":
          return respond(await getCoverage())
        case "autoheal":
          return respond(await autoHealLoop(payload.file, payload.error))
        case "memory":
          return respond(await getFullMemory())
        default:
          return respond({ error: "Ação desconhecida", action })
      }
    } catch (err: any) {
      respond({ error: err.message })
    }
  })

  function respond(data: any) {
    process.stdout.write(JSON.stringify(data) + "\n")
  }

  return events
} 
