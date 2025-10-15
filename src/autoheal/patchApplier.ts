import fs from 'fs'
import path from 'path'
import diff from 'diff'

/**
 * Aplica um patch sugerido pela LLM sobre o arquivo original.
 * Gera um diff .autoheal.diff para histórico e auditoria.
 */
export async function applyPatch(filePath: string, newCode: string): Promise<string> {
  const oldCode = fs.readFileSync(filePath, 'utf-8')
  const patch = diff.createTwoFilesPatch(filePath, filePath, oldCode, newCode)
  const diffPath = filePath.replace('.ts', `.autoheal.diff`)
  fs.writeFileSync(diffPath, patch, 'utf-8')

  const outDir = path.dirname(filePath)
  const healedPath = path.join(outDir, path.basename(filePath))
  fs.writeFileSync(healedPath, newCode, 'utf-8')

  console.log(`🩹 Patch aplicado e diff salvo em ${diffPath}`)
  return healedPath
}
