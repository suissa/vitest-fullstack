
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())

  return Response.json({
    message: "Olá do Atomic Behavior Routes 🚀",
    method: req.method,
    params,
    time: new Date().toISOString(),
  })
}
