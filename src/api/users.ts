import { PrismaClient } from '@prisma/client'
import { UserModel } from '../db/mongoose/connection'
import type { User } from '../types/entities'

const prisma = new PrismaClient()

export default async function handler({ req, body }) {
  const method = req.method?.toUpperCase()
  switch (method) {
    case 'GET':
      const users = await prisma.user.findMany()
      return { users }
    case 'POST':
      const newUser: User = { name: body.name, email: body.email }
      const created = await prisma.user.create({ data: newUser })
      await UserModel.create(newUser)
      return { created }
    case 'PUT':
      const updated = await prisma.user.update({
        where: { id: Number(body.id) },
        data: { name: body.name, email: body.email }
      })
      await UserModel.updateOne({ email: body.email }, { $set: body })
      return { updated }
    case 'DELETE':
      await prisma.user.delete({ where: { id: Number(body.id) } })
      await UserModel.deleteOne({ email: body.email })
      return { deleted: true }
    default:
      return { error: 'Method not allowed' }
  }
} 
