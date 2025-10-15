import fs from "fs"
import path from "path"
import { broadcastEvent } from "../server/websocket"

/**
 * Lê o relatório de cobertura do Vitest/Playwright.
 * Espera arquivo coverage-final.json gerado na pasta coverage/
 */
export async function getCoverage() {
  const coveragePath = path.resolve("coverage/coverage-final.json")

  try {
    if (!fs.existsSync(coveragePath)) throw new Error("Arquivo de cobertura não encontrado.")
    const json = JSON.parse(fs.readFileSync(coveragePath, "utf-8"))

    const summary = Object.entries(json).map(([file, data]: any) => ({
      file,
      statements: data.s.pct,
      branches: data.b.pct,
      functions: data.f.pct,
      lines: data.l.pct,
    }))

    broadcastEvent("coverage:update", { summary })
    return summary
  } catch (err: any) {
    broadcastEvent("coverage:error", { error: err.message })
    return { error: err.message }
  }
} 
