import { buildServer } from './server'
import dotenv from 'dotenv'

dotenv.config()

async function start() {
  const server = await buildServer()
  const port = Number(process.env.PORT) || 3000
  try {
    await server.listen({ port, host: '0.0.0.0' })
    console.log(`✅ Server running at http://localhost:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start() 
