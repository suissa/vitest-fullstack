import fp from 'fastify-plugin'

export default fp(async (app) => {
  app.addHook('onRequest', async (req) => {
    app.log.info(`📥 ${req.method} ${req.url}`)
  })
  app.addHook('onResponse', async (req, reply) => {
    app.log.info(`📤 ${req.method} ${req.url} → ${reply.statusCode}`)
  })
})
