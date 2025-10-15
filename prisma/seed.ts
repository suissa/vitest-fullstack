import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { name: 'Suissa', email: 'suissa@example.com' },
      { name: 'Maria', email: 'maria@example.com' }
    ],
    skipDuplicates: true
  })

  await prisma.product.createMany({
    data: [
      { name: 'Laptop', price: 5000 },
      { name: 'Mouse', price: 120 }
    ],
    skipDuplicates: true
  })

  console.log('🌱 Seed completed!')
}

main().finally(() => prisma.$disconnect()) 
