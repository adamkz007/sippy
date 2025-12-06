import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data (in reverse order of dependencies)
  console.log("🧹 Cleaning existing data...")
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.modifierOption.deleteMany()
  await prisma.productModifier.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.voucher.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.coffeeProfile.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.staffProfile.deleteMany()
  await prisma.cafe.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create demo cafe
  const cafe = await prisma.cafe.create({
    data: {
      name: "The Daily Grind",
      slug: "daily-grind",
      description: "Your neighborhood specialty coffee shop serving artisan coffee and fresh pastries",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      address: "123 Coffee Street",
      city: "Kuala Lumpur",
      country: "MY",
      phone: "+60 3 2345 6789",
      email: "hello@dailygrind.com.my",
      timezone: "Asia/Kuala_Lumpur",
      currency: "MYR",
      taxRate: 0.06,
      pointsPerDollar: 1,
      pointsPerRedemption: 100,
    },
  })
  console.log("✅ Created cafe:", cafe.name)

  // Create additional cafes for variety
  const cafe2 = await prisma.cafe.create({
    data: {
      name: "Brew Lab",
      slug: "brew-lab",
      description: "Experimental coffee roasters with single-origin specialty beans",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      address: "45 Roast Avenue",
      city: "Kuala Lumpur",
      country: "MY",
      phone: "+60 3 9876 5432",
      email: "hello@brewlab.com.my",
      timezone: "Asia/Kuala_Lumpur",
      currency: "MYR",
      taxRate: 0.06,
      pointsPerDollar: 1,
      pointsPerRedemption: 100,
    },
  })

  const cafe3 = await prisma.cafe.create({
    data: {
      name: "Coffee Collective",
      slug: "coffee-collective",
      description: "Community-focused cafe with cozy atmosphere",
      image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800",
      address: "78 Bean Street",
      city: "Kuala Lumpur",
      country: "MY",
      phone: "+60 3 1111 2222",
      email: "hello@coffeecollective.com.my",
      timezone: "Asia/Kuala_Lumpur",
      currency: "MYR",
      taxRate: 0.06,
      pointsPerDollar: 1,
      pointsPerRedemption: 100,
    },
  })
  console.log("✅ Created 3 cafes")

  // Create demo user (cafe owner)
  const passwordHash = await hash("demo1234", 12)
  const owner = await prisma.user.create({
    data: {
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

  // Create demo customer: alex@example.com
  const customerPasswordHash = await hash("customer123", 12)
  const alexUser = await prisma.user.create({
    data: {
      email: "alex@example.com",
      name: "Alex Chen",
      phone: "+60 12 345 6789",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  })

  const alexCustomer = await prisma.customer.create({
    data: {
      userId: alexUser.id,
      phone: "+60 12 345 6789",
      tier: "GOLD",
      pointsBalance: 2450,
      lifetimePoints: 5230,
      lifetimeSpend: 1245.00,
      totalOrders: 47,
    },
  })
  console.log("✅ Created demo customer:", alexUser.email)

  // Create coffee profile for Alex
  const coffeeProfile = await prisma.coffeeProfile.create({
    data: {
      customerId: alexCustomer.id,
      profileType: "Bold Explorer",
      roastPreference: 4.2,
      strength: 4.5,
      milkPreference: "oat",
      temperature: 3.8,
      sweetness: 2.1,
      adventureScore: 4.0,
      flavorNotes: ["Chocolate", "Caramel", "Nutty", "Bold"],
      confidence: 0.87,
    },
  })
  console.log("✅ Created coffee profile for Alex")

  // Create categories for main cafe
  const catCoffee = await prisma.category.create({
    data: { cafeId: cafe.id, name: "Coffee", sortOrder: 1 },
  })
  const catSpecialty = await prisma.category.create({
    data: { cafeId: cafe.id, name: "Specialty", sortOrder: 2 },
  })
  const catCold = await prisma.category.create({
    data: { cafeId: cafe.id, name: "Cold Drinks", sortOrder: 3 },
  })
  const catFood = await prisma.category.create({
    data: { cafeId: cafe.id, name: "Food", sortOrder: 4 },
  })
  const catTea = await prisma.category.create({
    data: { cafeId: cafe.id, name: "Tea", sortOrder: 5 },
  })
  console.log("✅ Created 5 categories")

  // Create products
  const flatWhite = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Flat White",
      description: "Velvety smooth espresso with steamed milk",
      price: 14.00,
      isPopular: true,
      roastLevel: "MEDIUM",
      flavorNotes: ["Smooth", "Creamy"],
    },
  })

  const longBlack = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Long Black",
      description: "Double shot espresso with hot water",
      price: 12.00,
      isPopular: true,
      roastLevel: "MEDIUM",
      flavorNotes: ["Bold", "Rich"],
    },
  })

  const cappuccino = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Cappuccino",
      description: "Espresso with steamed milk foam",
      price: 14.00,
      roastLevel: "MEDIUM",
    },
  })

  const latte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Latte",
      description: "Espresso with steamed milk",
      price: 14.00,
      roastLevel: "MEDIUM",
    },
  })

  const espresso = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Espresso",
      description: "Single shot of espresso",
      price: 10.00,
      roastLevel: "MEDIUM_DARK",
    },
  })

  const doubleEspresso = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Double Espresso",
      description: "Double shot of espresso",
      price: 13.00,
      roastLevel: "MEDIUM_DARK",
    },
  })

  const mocha = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Mocha",
      description: "Espresso with chocolate and steamed milk",
      price: 17.00,
      roastLevel: "MEDIUM",
      flavorNotes: ["Chocolate", "Sweet"],
    },
  })

  const piccolo = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCoffee.id,
      name: "Piccolo",
      description: "Ristretto shot with steamed milk",
      price: 12.00,
      roastLevel: "MEDIUM",
    },
  })

  // Specialty drinks
  const oatLatte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catSpecialty.id,
      name: "Oat Latte",
      description: "Espresso with oat milk",
      price: 17.00,
      isPopular: true,
    },
  })

  const turmericLatte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catSpecialty.id,
      name: "Turmeric Latte",
      description: "Golden milk with turmeric and spices",
      price: 17.00,
    },
  })

  const matchaLatte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catSpecialty.id,
      name: "Matcha Latte",
      description: "Premium Japanese matcha with steamed milk",
      price: 18.00,
    },
  })

  const chaiLatte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catSpecialty.id,
      name: "Chai Latte",
      description: "Spiced chai tea with steamed milk",
      price: 15.00,
    },
  })

  // Cold drinks
  const icedLatte = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCold.id,
      name: "Iced Latte",
      description: "Espresso with cold milk over ice",
      price: 15.00,
    },
  })

  const coldBrew = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCold.id,
      name: "Cold Brew",
      description: "24-hour steeped cold coffee",
      price: 14.00,
      isPopular: true,
      flavorNotes: ["Smooth", "Low Acidity"],
    },
  })

  const icedLongBlack = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCold.id,
      name: "Iced Long Black",
      description: "Double espresso over ice water",
      price: 13.00,
    },
  })

  const icedMocha = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catCold.id,
      name: "Iced Mocha",
      description: "Espresso with chocolate and cold milk over ice",
      price: 18.00,
    },
  })

  // Food items
  const avocadoToast = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catFood.id,
      name: "Avocado Toast",
      description: "Smashed avocado on sourdough with poached eggs",
      price: 28.00,
    },
  })

  const croissant = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catFood.id,
      name: "Croissant",
      description: "Freshly baked butter croissant",
      price: 12.00,
    },
  })

  const bananaBread = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catFood.id,
      name: "Banana Bread",
      description: "House-made banana bread with walnuts",
      price: 14.00,
    },
  })

  const muffin = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catFood.id,
      name: "Muffin",
      description: "Daily selection of fresh muffins",
      price: 10.00,
    },
  })

  // Tea
  const englishBreakfast = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catTea.id,
      name: "English Breakfast",
      description: "Classic black tea blend",
      price: 10.00,
    },
  })

  const earlGrey = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catTea.id,
      name: "Earl Grey",
      description: "Black tea with bergamot",
      price: 10.00,
    },
  })

  const greenTea = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catTea.id,
      name: "Green Tea",
      description: "Japanese sencha green tea",
      price: 10.00,
    },
  })

  const peppermint = await prisma.product.create({
    data: {
      cafeId: cafe.id,
      categoryId: catTea.id,
      name: "Peppermint",
      description: "Refreshing herbal peppermint tea",
      price: 10.00,
    },
  })

  console.log("✅ Created 24 products")

  // Create product modifiers for coffee drinks
  const milkModifier = await prisma.productModifier.create({
    data: {
      productId: flatWhite.id,
      name: "Milk Options",
      required: false,
      maxSelect: 1,
      options: {
        create: [
          { name: "Regular Milk", price: 0, isDefault: true },
          { name: "Oat Milk", price: 2.00 },
          { name: "Almond Milk", price: 2.00 },
          { name: "Soy Milk", price: 1.50 },
        ],
      },
    },
  })

  const extraShot = await prisma.productModifier.create({
    data: {
      productId: flatWhite.id,
      name: "Extra Shot",
      required: false,
      maxSelect: 2,
      options: {
        create: [
          { name: "Extra Shot", price: 3.00 },
        ],
      },
    },
  })

  console.log("✅ Created product modifiers")

  // Create tables
  await Promise.all([
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 1", capacity: 2, posX: 50, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 2", capacity: 2, posX: 150, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 3", capacity: 4, posX: 50, posY: 150 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Table 4", capacity: 4, posX: 150, posY: 150 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Bar 1", capacity: 1, posX: 250, posY: 50 } }),
    prisma.table.create({ data: { cafeId: cafe.id, name: "Bar 2", capacity: 1, posX: 300, posY: 50 } }),
  ])
  console.log("✅ Created 6 tables")

  // Create order history for Alex (completed orders)
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Active order (PREPARING)
  const activeOrder = await prisma.order.create({
    data: {
      orderNumber: "T-042",
      cafeId: cafe.id,
      customerId: alexCustomer.id,
      orderType: "PICKUP",
      status: "PREPARING",
      subtotal: 30.00,
      taxAmount: 1.80,
      discountAmount: 0,
      total: 31.80,
      pointsEarned: 32,
      pointsRedeemed: 0,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      items: {
        create: [
          {
            productId: flatWhite.id,
            name: "Flat White",
            quantity: 1,
            unitPrice: 16.00, // with oat milk
            modifiers: { milk: "Oat Milk", extraShot: true },
            total: 16.00,
          },
          {
            productId: bananaBread.id,
            name: "Banana Bread",
            quantity: 1,
            unitPrice: 14.00,
            total: 14.00,
          },
        ],
      },
    },
  })

  // Yesterday's order - completed
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "B-118",
      cafeId: cafe2.id,
      customerId: alexCustomer.id,
      orderType: "PICKUP",
      status: "COMPLETED",
      subtotal: 28.00,
      taxAmount: 1.68,
      discountAmount: 0,
      total: 29.68,
      pointsEarned: 30,
      pointsRedeemed: 0,
      createdAt: dayAgo,
      completedAt: dayAgo,
      items: {
        create: [
          {
            productId: coldBrew.id,
            name: "Cold Brew",
            quantity: 2,
            unitPrice: 14.00,
            modifiers: { size: "Large" },
            total: 28.00,
          },
        ],
      },
    },
  })

  // 3 days ago - completed with points redeemed
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "C-055",
      cafeId: cafe3.id,
      customerId: alexCustomer.id,
      orderType: "DINE_IN",
      status: "COMPLETED",
      subtotal: 45.00,
      taxAmount: 2.70,
      discountAmount: 5.00, // Redeemed voucher
      total: 42.70,
      pointsEarned: 0, // No points earned when using voucher
      pointsRedeemed: 500,
      createdAt: threeDaysAgo,
      completedAt: threeDaysAgo,
      items: {
        create: [
          {
            productId: oatLatte.id,
            name: "Oat Latte",
            quantity: 1,
            unitPrice: 17.00,
            total: 17.00,
          },
          {
            productId: avocadoToast.id,
            name: "Avocado Toast",
            quantity: 1,
            unitPrice: 28.00,
            modifiers: { extra: "Extra feta" },
            total: 28.00,
          },
        ],
      },
    },
  })

  // 5 days ago - completed
  const order4 = await prisma.order.create({
    data: {
      orderNumber: "T-039",
      cafeId: cafe.id,
      customerId: alexCustomer.id,
      orderType: "TAKEAWAY",
      status: "COMPLETED",
      subtotal: 12.00,
      taxAmount: 0.72,
      discountAmount: 0,
      total: 12.72,
      pointsEarned: 13,
      pointsRedeemed: 0,
      createdAt: fiveDaysAgo,
      completedAt: fiveDaysAgo,
      items: {
        create: [
          {
            productId: longBlack.id,
            name: "Long Black",
            quantity: 1,
            unitPrice: 12.00,
            total: 12.00,
          },
        ],
      },
    },
  })

  // Week ago - completed
  const order5 = await prisma.order.create({
    data: {
      orderNumber: "T-031",
      cafeId: cafe.id,
      customerId: alexCustomer.id,
      orderType: "PICKUP",
      status: "COMPLETED",
      subtotal: 31.00,
      taxAmount: 1.86,
      discountAmount: 0,
      total: 32.86,
      pointsEarned: 33,
      pointsRedeemed: 0,
      createdAt: weekAgo,
      completedAt: weekAgo,
      items: {
        create: [
          {
            productId: flatWhite.id,
            name: "Flat White",
            quantity: 1,
            unitPrice: 14.00,
            total: 14.00,
          },
          {
            productId: oatLatte.id,
            name: "Oat Latte",
            quantity: 1,
            unitPrice: 17.00,
            total: 17.00,
          },
        ],
      },
    },
  })

  console.log("✅ Created 5 orders for Alex")

  // Create payment records
  await prisma.payment.createMany({
    data: [
      { orderId: activeOrder.id, method: "CARD", amount: 31.80, status: "COMPLETED" },
      { orderId: order2.id, method: "CARD", amount: 29.68, status: "COMPLETED" },
      { orderId: order3.id, method: "MOBILE", amount: 42.70, status: "COMPLETED" },
      { orderId: order4.id, method: "CASH", amount: 12.72, cashReceived: 15.00, cashChange: 2.28, status: "COMPLETED" },
      { orderId: order5.id, method: "CARD", amount: 32.86, status: "COMPLETED" },
    ],
  })
  console.log("✅ Created payment records")

  // Create point transactions for Alex
  let runningBalance = 2450

  // Recent transactions (most recent first for display)
  const transactions = [
    { type: "EARN", points: 32, desc: "Purchase at The Daily Grind", orderId: activeOrder.id, cafeId: cafe.id, date: now },
    { type: "EARN", points: 30, desc: "Purchase at Brew Lab", orderId: order2.id, cafeId: cafe2.id, date: dayAgo },
    { type: "REDEEM", points: -500, desc: "Redeemed Free Flat White", orderId: order3.id, cafeId: cafe3.id, date: threeDaysAgo },
    { type: "BONUS", points: 50, desc: "7-day streak bonus!", orderId: null, cafeId: cafe.id, date: threeDaysAgo },
    { type: "EARN", points: 13, desc: "Purchase at The Daily Grind", orderId: order4.id, cafeId: cafe.id, date: fiveDaysAgo },
    { type: "EARN", points: 33, desc: "Purchase at The Daily Grind", orderId: order5.id, cafeId: cafe.id, date: weekAgo },
    { type: "EARN", points: 45, desc: "Purchase at Brew Lab", orderId: null, cafeId: cafe2.id, date: twoWeeksAgo },
    { type: "BONUS", points: 100, desc: "Welcome bonus", orderId: null, cafeId: cafe.id, date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
  ]

  // Calculate balances in reverse order (oldest first) for accurate balanceAfter
  const sortedTransactions = [...transactions].reverse()
  let balance = 2450 - sortedTransactions.reduce((sum, t) => sum + t.points, 0) // Starting balance before all these transactions

  for (const txn of sortedTransactions) {
    balance += txn.points
    await prisma.pointTransaction.create({
      data: {
        customerId: alexCustomer.id,
        cafeId: txn.cafeId,
        orderId: txn.orderId,
        type: txn.type as any,
        points: txn.points,
        balanceAfter: balance,
        description: txn.desc,
        createdAt: txn.date,
      },
    })
  }
  console.log("✅ Created point transactions")

  // Create vouchers for Alex
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  await prisma.voucher.createMany({
    data: [
      {
        customerId: alexCustomer.id,
        code: "FREE-FW-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "FREE_DRINK",
        value: 14.00,
        pointsCost: 500,
        status: "ACTIVE",
        expiresAt: thirtyDaysFromNow,
      },
      {
        customerId: alexCustomer.id,
        code: "OFF5-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "FIXED_AMOUNT",
        value: 5.00,
        pointsCost: 400,
        status: "ACTIVE",
        expiresAt: fourteenDaysFromNow,
      },
      {
        customerId: alexCustomer.id,
        code: "SIZE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        type: "FREE_UPGRADE",
        value: 1,
        pointsCost: 200,
        status: "ACTIVE",
        expiresAt: sevenDaysFromNow,
      },
    ],
  })
  console.log("✅ Created 3 vouchers for Alex")

  // Create categories and products for other cafes
  const cafe2CatCoffee = await prisma.category.create({
    data: { cafeId: cafe2.id, name: "Coffee", sortOrder: 1 },
  })
  const cafe2CatSpecialty = await prisma.category.create({
    data: { cafeId: cafe2.id, name: "Pour Over", sortOrder: 2 },
  })

  await prisma.product.createMany({
    data: [
      { cafeId: cafe2.id, categoryId: cafe2CatCoffee.id, name: "Flat White", price: 15.00, isPopular: true },
      { cafeId: cafe2.id, categoryId: cafe2CatCoffee.id, name: "Long Black", price: 13.00 },
      { cafeId: cafe2.id, categoryId: cafe2CatCoffee.id, name: "Cold Brew", price: 14.00, isPopular: true },
      { cafeId: cafe2.id, categoryId: cafe2CatSpecialty.id, name: "Ethiopian Yirgacheffe", price: 18.00, description: "Fruity, floral notes" },
      { cafeId: cafe2.id, categoryId: cafe2CatSpecialty.id, name: "Guatemala Antigua", price: 18.00, description: "Chocolate & spice" },
    ],
  })

  const cafe3CatCoffee = await prisma.category.create({
    data: { cafeId: cafe3.id, name: "Coffee", sortOrder: 1 },
  })
  const cafe3CatFood = await prisma.category.create({
    data: { cafeId: cafe3.id, name: "Food", sortOrder: 2 },
  })

  await prisma.product.createMany({
    data: [
      { cafeId: cafe3.id, categoryId: cafe3CatCoffee.id, name: "Flat White", price: 14.00, isPopular: true },
      { cafeId: cafe3.id, categoryId: cafe3CatCoffee.id, name: "Oat Latte", price: 17.00, isPopular: true },
      { cafeId: cafe3.id, categoryId: cafe3CatCoffee.id, name: "Espresso", price: 10.00 },
      { cafeId: cafe3.id, categoryId: cafe3CatFood.id, name: "Avocado Toast", price: 28.00 },
      { cafeId: cafe3.id, categoryId: cafe3CatFood.id, name: "Granola Bowl", price: 22.00 },
    ],
  })

  console.log("✅ Created products for all cafes")

  console.log("")
  console.log("🎉 Seed completed!")
  console.log("")
  console.log("Demo credentials:")
  console.log("  Cafe Owner:")
  console.log("    Email: demo@sippy.coffee")
  console.log("    Password: demo1234")
  console.log("")
  console.log("  Customer:")
  console.log("    Email: alex@example.com")
  console.log("    Password: customer123")
  console.log("    Tier: GOLD")
  console.log("    Points: 2,450")
  console.log("    Orders: 47")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
