import { saveJsonMemory } from "./jsonMemory"
import { saveGraphMemory } from "./graphMemory"

/**
 * Registra memória híbrida (JSON + Grafo)
 * usada por AutoHeal, NLT e MCP
 */
export async function recordMemory(entry: any) {
  try {
    // salva no JSON local
    saveJsonMemory(entry)

    // salva no grafo (Neo4j)
    await saveGraphMemory(entry)

    console.log("🧠 Memória híbrida registrada com sucesso.")
  } catch (err) {
    console.error("❌ Erro ao registrar memória híbrida:", err)
  }
}

/**
 * Recupera todo o histórico local
 */
export async function getFullMemory() {
  const { loadJsonMemory } = await import("./jsonMemory")
  const json = loadJsonMemory()
  return json
}
