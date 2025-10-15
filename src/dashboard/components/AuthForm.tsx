import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuthForm({ onAuth }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function login() {
    try {
      const res = await fetch("http://localhost:5050/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) onAuth(data.user)
      else setError(data.error || "Falha na autenticação")
    } catch (err) {
      setError("Erro de rede")
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded space-y-3">
      <h2 className="text-xl font-bold">Login</h2>
      <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={login}>Entrar</Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
} 
