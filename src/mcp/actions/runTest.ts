import { exec } from "child_process"
import util from "util"
import path from "path"
import { broadcastEvent } from "../server/websocket"

const execAsync = util.promisify(exec)

/**
 * Executa testes unitários, integração ou e2e
 * Usa Vitest e Playwright com saída em JSON
 */
export async function runTest(file: string, type = "unit") {
  const testPath = path.resolve(file)
  const cmd =
    type === "e2e"
      ? `npx playwright test --reporter=json`
      : `npx vitest run ${testPath} --reporter=json`

  broadcastEvent("test:start", { file, type })

  try {
    const { stdout } = await execAsync(cmd, { cwd: process.cwd() })
    const result = JSON.parse(stdout)
    broadcastEvent("test:success", { file, result })
    return result
  } catch (err: any) {
    broadcastEvent("test:fail", { file, error: err.message })
    return { error: err.message }
  }
}
