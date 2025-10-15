import fs from "fs"
import axios from "axios"
import { applyPatch } from "../../autoheal/patchApplier"
import { broadcastEvent } from "../server/websocket"
import { recordMemory } from "../../memory/memoryHub"

export async function editWithLLM(file: string, prompt: string) {
  const code = fs.readFileSync(file, "utf-8")
  broadcastEvent("edit:start", { file, prompt })

  try {
    const llmPrompt = `
Você é um assistente de engenharia de software.
Analise o código abaixo e aplique as modificações solicitadas no prompt.

--- ARQUIVO ---
${file}

--- CÓDIGO ---
${code}

--- INSTRUÇÕES ---
${prompt}
    `.trim()

    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.LLM_MODEL || "mistralai/mistral-7b",
        messages: [
          {
            role: "system",
            content: "Você é um engenheiro de software especialista em TypeScript e testes automatizados.",
          },
          { role: "user", content: llmPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "HTTP-Referer": "MCP-Edit",
        },
      }
    )

    const newCode = res.data.choices[0].message.content
    const patchedFile = await applyPatch(file, newCode)

    const entry = {
      file,
      prompt,
      newCode,
      healed: true,
      timestamp: new Date().toISOString(),
    }

    await recordMemory(entry)
    broadcastEvent("edit:success", { file, patchedFile })

    return { patchedFile, newCode }
  } catch (err: any) {
    broadcastEvent("edit:fail", { file, error: err.message })
    return { error: err.message }
  }
} 
