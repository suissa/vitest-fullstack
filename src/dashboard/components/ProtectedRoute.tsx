import AuthForm from "./AuthForm"
import { useState } from "react"

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)

  if (!user) return <AuthForm onAuth={setUser} />
  return <>{children}</>
}
