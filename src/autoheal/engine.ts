import fs from 'fs'
import path from 'path'
import axios from 'axios'
import crypto from 'crypto'
import { applyPatch } from './patchApplier'
import { recordMemory } from '../memory/memoryHub'

const HISTORY_PATH = path.resolve('memory/autoheal-history.json')

export interface AutoHealEntry {
  testFile: string
  prompt: string
  errorLog: string
  patches: string[]
  healed: boolean
  iteration: number
  timestamp: string
}

/**
 * AutoHeal Loop 3.1
 * - Recebe um teste falho, gera prompts para múltiplas LLMs
 * - Aplica patch por consenso
 * - Registra memória JSON + grafo
 */
export async function autoHealLoop(testFile: string, logOutput: string, iteration = 1) {
  if (iteration > 3) {
    console.log('⚠️  Limite de tentativas atingido.')
    return { healed: false }
  }

  const baseCode = fs.readFileSync(testFile, 'utf-8')
  const promptBase = `
O teste abaixo falhou. Corrija o código mantendo o estilo TypeScript e compatibilidade com Vitest.

--- TESTE ---
${baseCode}

--- LOG DE ERRO ---
${logOutput}
  `.trim()

  // Modelos gratuitos e configuráveis via OpenRouter
  const models = [
    { id: 'mistralai/mistral-7b', persona: 'professor' },
    { id: 'openchat/openchat-7b', persona: 'hacker' },
    { id: 'nousresearch/nous-hermes-2-mistral', persona: 'auditor' },
  ]

  const responses: string[] = []
  for (const model of models) {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model.id,
          messages: [
            {
              role: 'system',
              content: `Você é um engenheiro de testes ${model.persona}. Corrija erros sem mudar a lógica.`,
            },
            { role: 'user', content: promptBase },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'HTTP-Referer': 'ViteAPI-AutoHeal',
          },
          timeout: 120000,
        },
      )
      responses.push(res.data.choices[0].message.content)
    } catch (err: any) {
      console.error(`❌ Erro com modelo ${model.id}:`, err.message)
    }
  }

  if (!responses.length) {
    console.warn('⚠️ Nenhuma resposta obtida das LLMs.')
    return { healed: false }
  }

  const majority = selectMajority(responses)
  const patchFile = await applyPatch(testFile, majority)

  const entry: AutoHealEntry = {
    testFile,
    prompt: promptBase,
    errorLog: logOutput,
    patches: responses,
    healed: true,
    iteration,
    timestamp: new Date().toISOString(),
  }

  // grava histórico + grafo
  await recordMemory(entry)
  saveLocalHistory(entry)

  console.log(`✅ Patch aplicado com sucesso em ${patchFile}`)
  return { healed: true, healedFile: patchFile }
}

/**
 * Seleciona o patch por consenso (hash idêntico em ≥2 respostas)
 */
function selectMajority(responses: string[]): string {
  const hashes = responses.map((r) =>
    crypto.createHash('sha256').update(r).digest('hex'),
  )
  const counts: Record<string, number> = {}
  for (const hash of hashes) counts[hash] = (counts[hash] || 0) + 1
  const [winner] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const index = hashes.indexOf(winner)
  return responses[index]
}

/**
 * Persiste histórico local em JSON
 */
function saveLocalHistory(entry: AutoHealEntry) {
  const history = fs.existsSync(HISTORY_PATH)
    ? JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'))
    : []
  history.push(entry)
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2))
}
