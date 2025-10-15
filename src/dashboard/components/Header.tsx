import { Button } from "@/components/ui/button"

export default function Header({ user, onLogout }) {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-background/80 backdrop-blur">
      <h1 className="text-xl font-bold">🧠 MCP Dashboard</h1>
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Olá, {user.name}</span>
          <Button variant="outline" onClick={onLogout}>
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
