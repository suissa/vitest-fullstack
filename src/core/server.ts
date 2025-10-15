import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import fastifyPlugin from 'fastify-plugin'

dotenv.config()

// Função principal de criação do servidor
export async function buildServer() {
  const app = Fastify({
    logger: true,
    trustProxy: true
  })

  // Plugins básicos
  await app.register(fastifyHelmet)
  await app.register(fastifyCookie, { secret: process.env.JWT_SECRET || 'secret' })
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  // Carrega decorators
  const pluginsPath = path.resolve('src/plugins')
  const plugins = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.ts'))
  for (const pluginFile of plugins) {
    const plugin = await import(path.join(pluginsPath, pluginFile))
    if (plugin.default) await app.register(fastifyPlugin(plugin.default))
  }

  // Carrega rotas /api
  const routesPath = path.resolve('src/api')
  const routes = fs.readdirSync(routesPath).filter(f => f.endsWith('.ts'))
  for (const routeFile of routes) {
    const route = await import(path.join(routesPath, routeFile))
    const handler = route.default
    if (typeof handler === 'function') {
      const routeName = '/' + routeFile.replace('.ts', '')
      app.all(`/api${routeName}`, handler)
    }
  }

  app.get('/', async () => ({ message: 'ViteAPI Fastify v2 running 🚀' }))
  return app
} 
