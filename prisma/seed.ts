import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo cafe
  const cafe = await prisma.cafe.upsert({
    where: { slug: "daily-grind" },
    update: {},
    create: {
      name: "The Daily Grind",
      slug: "daily-grind",
      description: "Your neighborhood specialty coffee shop",
      address: "123 Coffee Street",
      city: "Melbourne",
      country: "AU",
      phone: "+61 3 9999 8888",
      email: "hello@dailygrind.com.au",
      timezone: "Australia/Sydney",
      currency: "AUD",
      taxRate: 0.10,
      pointsPerDollar: 1,
      pointsPerRedemption: 100,
    },
  })
  console.log("✅ Created cafe:", cafe.name)

  // Create demo user (cafe owner)
  const passwordHash = await hash("demo1234", 12)
  const owner = await prisma.user.upsert({
    where: { email: "demo@sippy.coffee" },
    update: {},
    create: {
      email: "demo@sippy.coffee",
      name: "Demo Owner",
      passwordHash,
      role: "OWNER",
      staffProfiles: {
        create: {
          cafeId: cafe.id,
          role: "OWNER",
        },
      },
    },
  })
  console.log("✅ Created demo owner:", owner.email)

  // Create demo customer
  const customer = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      email: "alex@example.com",
      name: "Alex Smith",
      passwordHash: await hash("customer123", 12),
      role: "CUSTOMER",
      customer: {
        create: {
          phone: "+61 400 111 222",
          tier: "GOLD",
          pointsBalance: 2450,
          lifetimePoints: 5230,
          lifetimeSpend: 1245.00,
          totalOrders: 87,
        },
      },
    },
  })
  console.log("✅ Created demo customer:", customer.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-coffee" },
      update: {},
      create: { id: "cat-coffee", cafeId: cafe.id, name: "Coffee", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { id: "cat-specialty" },
      update: {},
      create: { id: "cat-specialty", cafeId: cafe.id, name: "Specialty", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { id: "cat-cold" },
      update: {},
      create: { id: "cat-cold", cafeId: cafe.id, name: "Cold Drinks", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { id: "cat-food" },
      update: {},
      create: { id: "cat-food", cafeId: cafe.id, name: "Food", sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { id: "cat-tea" },
      update: {},
      create: { id: "cat-tea", cafeId: cafe.id, name: "Tea", sortOrder: 5 },
    }),
  ])
  console.log("✅ Created", categories.length, "categories")

  // Create products
  const coffeeProducts = [
    { name: "Flat White", price: 5.50, isPopular: true, roastLevel: "MEDIUM" as const },
    { name: "Long Black", price: 4.50, isPopular: true, roastLevel: "MEDIUM" as const },
    { name: "Cappuccino", price: 5.50, roastLevel: "MEDIUM" as const },
    { name: "Latte", price: 5.50, roastLevel: "MEDIUM" as const },
    { name: "Espresso", price: 4.00, roastLevel: "MEDIUM_DARK" as const },
    { name: "Double Espresso", price: 5.00, roastLevel: "MEDIUM_DARK" as const },
    { name: "Mocha", price: 6.50, roastLevel: "MEDIUM" as const },
    { name: "Piccolo", price: 4.50, roastLevel: "MEDIUM" as const },
  ]

  const specialtyProducts = [
    { name: "Oat Latte", price: 6.50, isPopular: true },
    { name: "Turmeric Latte", price: 6.50 },
    { name: "Matcha Latte", price: 7.00 },
    { name: "Chai Latte", price: 6.00 },
  ]

  const coldProducts = [
    { name: "Iced Latte", price: 6.00 },
    { name: "Cold Brew", price: 5.50, isPopular: true },
    { name: "Iced Long Black", price: 5.00 },
    { name: "Iced Mocha", price: 7.00 },
  ]

  const foodProducts = [
    { name: "Avocado Toast", price: 16.00 },
    { name: "Croissant", price: 5.50 },
    { name: "Banana Bread", price: 6.50 },
    { name: "Muffin", price: 5.00 },
  ]

  const teaProducts = [
    { name: "English Breakfast", price: 4.50 },
    { name: "Earl Grey", price: 4.50 },
    { name: "Green Tea", price: 4.50 },
    { name: "Peppermint", price: 4.50 },
  ]

  let productCount = 0
  const catCoffee = categories.find(c => c.name === "Coffee")!
  const catSpecialty = categories.find(c => c.name === "Specialty")!
  const catCold = categories.find(c => c.name === "Cold Drinks")!
  const catFood = categories.find(c => c.name === "Food")!
  const catTea = categories.find(c => c.name === "Tea")!

  for (const product of coffeeProducts) {
    await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: catCoffee.id,
        ...product,
      },
    })
    productCount++
  }

  for (const product of specialtyProducts) {
    await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: catSpecialty.id,
        ...product,
      },
    })
    productCount++
  }

  for (const product of coldProducts) {
    await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: catCold.id,
        ...product,
      },
    })
    productCount++
  }

  for (const product of foodProducts) {
    await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: catFood.id,
        ...product,
      },
    })
    productCount++
  }

  for (const product of teaProducts) {
    await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: catTea.id,
        ...product,
      },
    })
    productCount++
  }

  console.log("✅ Created", productCount, "products")

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 1", capacity: 2, posX: 50, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 2", capacity: 2, posX: 150, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 3", capacity: 4, posX: 50, posY: 150 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 4", capacity: 4, posX: 150, posY: 150 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Bar 1", capacity: 1, posX: 250, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Bar 2", capacity: 1, posX: 300, posY: 50 } }),
  ])
  console.log("✅ Created", tables.length, "tables")

  console.log("")
  console.log("🎉 Seed completed!")
  console.log("")
  console.log("Demo credentials:")
  console.log("  Email: demo@sippy.coffee")
  console.log("  Password: demo1234")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

