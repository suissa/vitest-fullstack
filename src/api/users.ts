const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

export default async function handler({ req, body }) {
  if (req.method === 'GET') return users
  if (req.method === 'POST') {
    const newUser = { id: users.length + 1, ...body }
    users.push(newUser)
    return newUser
  }
  return { error: 'Method not allowed' }
}
