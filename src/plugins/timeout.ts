import fp from 'fastify-plugin'

export default fp(async (app) => {
  app.addHook('onRequest', async (req, reply) => {
    reply.socket.setTimeout(10000) // 10s
  })
})
