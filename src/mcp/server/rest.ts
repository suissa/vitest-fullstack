import Fastify from "fastify"
import cors from "@fastify/cors"
import { runTest } from "../actions/runTest"
import { editWithLLM } from "../actions/editWithLLM"
import { getCoverage } from "../actions/getCoverage"
import { autoHealLoop } from "../../autoheal/engine"
import { getFullMemory } from "../../memory/memoryHub"

export async function createRestServer() {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: "*" })

  // Healthcheck
  app.get("/mcp/health", async () => ({ status: "ok" }))

  // Executa um teste (BDD, e2e ou unitário)
  app.post("/mcp/run", async (req, reply) => {
    const { file, type } = req.body as any
    const result = await runTest(file, type)
    return { result }
  })

  // Pede para a LLM editar/corrigir arquivo
  app.post("/mcp/edit", async (req, reply) => {
    const { file, prompt } = req.body as any
    const result = await editWithLLM(file, prompt)
    return { result }
  })

  // Obter cobertura e métricas de testes
  app.get("/mcp/coverage", async () => {
    const result = await getCoverage()
    return { coverage: result }
  })

  // Rodar AutoHeal manualmente
  app.post("/mcp/autoheal", async (req, reply) => {
    const { file, error } = req.body as any
    const result = await autoHealLoop(file, error)
    return { result }
  })

  // Retorna memória completa
  app.get("/mcp/memory", async () => {
    const mem = await getFullMemory()
    return { memory: mem }
  })

  const port = Number(process.env.MCP_PORT) || 5050
  await app.listen({ port, host: "0.0.0.0" })
  console.log(`🌐 MCP REST rodando em http://localhost:${port}`)
}
