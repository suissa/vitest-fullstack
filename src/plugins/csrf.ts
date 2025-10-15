import fp from 'fastify-plugin'
import fastifyCsrf from '@fastify/csrf-protection'

export default fp(async (app) => {
  await app.register(fastifyCsrf)
}) 
