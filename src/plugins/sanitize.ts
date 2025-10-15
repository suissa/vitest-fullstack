import fp from 'fastify-plugin'
import sanitizeHtml from 'sanitize-html'

export default fp(async (app) => {
  app.decorate('sanitize', (input: string) => sanitizeHtml(input))
}) 
