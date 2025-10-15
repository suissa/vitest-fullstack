export default async function pingAction(body: any) {
  return {
    message: "pong",
    received: body,
    timestamp: new Date().toISOString(),
  }
} 
