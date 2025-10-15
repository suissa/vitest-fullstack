import fs from "fs"
import path from "path"

const HISTORY_PATH = path.resolve("memory/autoheal-history.json")

/**
 * Adiciona uma entrada ao histórico JSON local
 */
export function saveJsonMemory(entry: any) {
  const history = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"))
    : []
  history.push({ ...entry, timestamp: new Date().toISOString() })
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true })
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2))
  console.log(`🧠 Memória JSON atualizada (${history.length} entradas)`)
}

/**
 * Lê o histórico completo da memória JSON
 */
export function loadJsonMemory() {
  if (!fs.existsSync(HISTORY_PATH)) return []
  return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"))
}
