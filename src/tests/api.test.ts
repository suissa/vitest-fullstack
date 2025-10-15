import { describe, it, expect } from 'vitest'
import fetch from 'node-fetch'

const base = 'http://localhost:5173/api'

describe('ViteAPI routes', () => {
  it('responds to /hello', async () => {
    const res = await fetch(`${base}/hello`)
    const data = await res.json()
    expect(data.message).toBe('Hello from ViteAPI!')
  })

  it('creates user via /users', async () => {
    const res = await fetch(`${base}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Maria' }),
    })
    const data = await res.json()
    expect(data.created.name).toBe('Maria')
  })

  it('lists products via /products', async () => {
    const res = await fetch(`${base}/products`)
    const data = await res.json()
    expect(data.products.length).toBeGreaterThan(0)
  })
})
