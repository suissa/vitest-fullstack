import { PrismaClient } from '@prisma/client'
import { ProductModel } from '../db/mongoose/connection'
import type { Product } from '../types/entities'

const prisma = new PrismaClient()

export default async function handler({ req, body }) {
  const method = req.method?.toUpperCase()
  switch (method) {
    case 'GET':
      const products = await prisma.product.findMany()
      return { products }
    case 'POST':
      const newProduct: Product = { name: body.name, price: body.price }
      const created = await prisma.product.create({ data: newProduct })
      await ProductModel.create(newProduct)
      return { created }
    case 'PUT':
      const updated = await prisma.product.update({
        where: { id: Number(body.id) },
        data: { name: body.name, price: body.price }
      })
      await ProductModel.updateOne({ name: body.name }, { $set: body })
      return { updated }
    case 'DELETE':
      await prisma.product.delete({ where: { id: Number(body.id) } })
      await ProductModel.deleteOne({ name: body.name })
      return { deleted: true }
    default:
      return { error: 'Method not allowed' }
  }
} 
