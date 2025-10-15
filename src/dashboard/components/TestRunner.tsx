import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestRunner() {
  const [file, setFile] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  async function callAPI(path: string, data: any) {
    setLoading(true)
    await fetch(`http://localhost:5050/mcp/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="caminho/do/teste.ts"
        value={file}
        onChange={(e) => setFile(e.target.value)}
      />
      <Input
        placeholder="instruções para editar (prompt)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex gap-2">
        <Button disabled={loading} onClick={() => callAPI("run", { file, type: "unit" })}>
          Rodar Unit
        </Button>
        <Button disabled={loading} onClick={() => callAPI("run", { file, type: "integration" })}>
          Rodar Integration
        </Button>
        <Button disabled={loading} onClick={() => callAPI("run", { file, type: "e2e" })}>
          Rodar E2E
        </Button>
        <Button disabled={loading} variant="secondary" onClick={() => callAPI("edit", { file, prompt })}>
          Editar com LLM
        </Button>
      </div>
    </div>
  )
} 
