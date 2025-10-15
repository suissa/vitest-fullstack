export default async function handler({ req }) {
  return { message: 'Hello from Vite API!', method: req.method }
}
