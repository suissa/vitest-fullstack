import React, { useState } from "react"
import ReactDOM from "react-dom/client"

const user = import.meta.env.VITE_DASHBOARD_USER || "admin"
const pass = import.meta.env.VITE_DASHBOARD_PASS || "atomic123_7ffrFBj"

function Login({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("")
  const [p, setP] = useState("")
  const [err, setErr] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (u === user && p === pass) onLogin()
    else setErr("Credenciais inválidas")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-4 w-80"
      >
        <h1 className="text-xl font-bold">Vite Fullstack Dashboard</h1>
        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          placeholder="Usuário"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          type="password"
          className="p-2 rounded bg-gray-700 focus:outline-none"
          placeholder="Senha"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-semibold">
          Entrar
        </button>
      </form>
    </div>
  )
}

function Dashboard() {
  const [log, setLog] = useState<string[]>([])

  async function callPing() {
    const res = await fetch("/api/mcp/rest?action=ping", {
      method: "POST",
      body: JSON.stringify({ hello: "MCP" }),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setLog((l) => [...l, JSON.stringify(data, null, 2)])
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🧠 Vite Fullstack Dashboard</h1>
      <button
        onClick={callPing}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
      >
        Testar MCP Action (ping)
      </button>
      <pre className="mt-6 bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
        {log.join("\n")}
      </pre>
    </div>
  )
}

function App() {
  const [auth, setAuth] = useState(false)
  return auth ? <Dashboard /> : <Login onLogin={() => setAuth(true)} />
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
