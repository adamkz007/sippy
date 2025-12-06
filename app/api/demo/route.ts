import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

const OWNER_CREDENTIALS = {
  email: "demo@sippy.coffee",
  password: "demo1234",
  name: "Demo Owner",
  phone: "+60 3 2345 6789",
}

const CUSTOMER_CREDENTIALS = {
  email: "alex@example.com",
  password: "customer123",
  name: "Alex Chen",
  phone: "+60 12 345 6789",
}

const DEMO_CAFE = {
  name: "The Daily Grind",
  slug: "daily-grind",
  description: "Your neighborhood specialty coffee shop serving artisan coffee and fresh pastries",
  image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  address: "168 Jalan Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur",
  city: "Kuala Lumpur",
  country: "MY",
  latitude: 3.1478,
  longitude: 101.7108,
  placeId: "ChIJWX5LmJI1zDER-demo-cafe1",
  phone: "+60 3 2345 6789",
  email: "hello@dailygrind.com.my",
  timezone: "Asia/Kuala_Lumpur",
  currency: "MYR",
  taxRate: 0.06,
  pointsPerDollar: 1,
  pointsPerRedemption: 100,
}

const CATEGORY_SEEDS = [
  { name: "Coffee", sortOrder: 1 },
  { name: "Specialty", sortOrder: 2 },
  { name: "Cold Drinks", sortOrder: 3 },
  { name: "Food", sortOrder: 4 },
]

const PRODUCT_SEEDS = [
  {
    name: "Flat White",
    category: "Coffee",
    description: "Velvety smooth espresso with steamed milk",
    price: 14,
    isPopular: true,
    roastLevel: "MEDIUM",
    flavorNotes: ["Smooth", "Creamy"],
  },
  {
    name: "Long Black",
    category: "Coffee",
    description: "Double shot espresso with hot water",
    price: 12,
    isPopular: true,
    roastLevel: "MEDIUM",
    flavorNotes: ["Bold", "Rich"],
  },
  {
    name: "Oat Latte",
    category: "Specialty",
    description: "Espresso with oat milk",
    price: 17,
    isPopular: true,
  },
  {
    name: "Cold Brew",
    category: "Cold Drinks",
    description: "24-hour steeped cold coffee",
    price: 14,
    isPopular: true,
    flavorNotes: ["Smooth", "Low Acidity"],
  },
  {
    name: "Avocado Toast",
    category: "Food",
    description: "Smashed avocado on sourdough with poached eggs",
    price: 28,
  },
]

const TABLE_SEEDS = [
  { name: "Table 1", capacity: 2, posX: 50, posY: 50 },
  { name: "Table 2", capacity: 2, posX: 150, posY: 50 },
  { name: "Table 3", capacity: 4, posX: 50, posY: 150 },
  { name: "Bar 1", capacity: 1, posX: 250, posY: 50 },
]

const COFFEE_PROFILE_SEED = {
  profileType: "Bold Explorer",
  roastPreference: 4.2,
  strength: 4.5,
  milkPreference: "oat",
  temperature: 3.8,
  sweetness: 2.1,
  adventureScore: 4.0,
  flavorNotes: ["Chocolate", "Caramel", "Nutty", "Bold"],
  confidence: 0.87,
}

export async function POST() {
  try {
    const [ownerPasswordHash, customerPasswordHash] = await Promise.all([
      hash(OWNER_CREDENTIALS.password, 12),
      hash(CUSTOMER_CREDENTIALS.password, 12),
    ])

    const cafe = await prisma.cafe.upsert({
      where: { slug: DEMO_CAFE.slug },
      update: {
        ...DEMO_CAFE,
      },
      create: {
        ...DEMO_CAFE,
      },
    })

    const owner = await prisma.user.upsert({
      where: { email: OWNER_CREDENTIALS.email },
      update: {
        name: OWNER_CREDENTIALS.name,
        phone: OWNER_CREDENTIALS.phone,
        passwordHash: ownerPasswordHash,
        role: "OWNER",
      },
      create: {
        email: OWNER_CREDENTIALS.email,
        name: OWNER_CREDENTIALS.name,
        phone: OWNER_CREDENTIALS.phone,
        passwordHash: ownerPasswordHash,
        role: "OWNER",
      },
    })

    await prisma.staffProfile.upsert({
      where: { userId_cafeId: { userId: owner.id, cafeId: cafe.id } },
      update: {
        role: "OWNER",
        isActive: true,
      },
      create: {
        userId: owner.id,
        cafeId: cafe.id,
        role: "OWNER",
        isActive: true,
      },
    })

    const customerUser = await prisma.user.upsert({
      where: { email: CUSTOMER_CREDENTIALS.email },
      update: {
        name: CUSTOMER_CREDENTIALS.name,
        phone: CUSTOMER_CREDENTIALS.phone,
        passwordHash: customerPasswordHash,
        role: "CUSTOMER",
      },
      create: {
        email: CUSTOMER_CREDENTIALS.email,
        name: CUSTOMER_CREDENTIALS.name,
        phone: CUSTOMER_CREDENTIALS.phone,
        passwordHash: customerPasswordHash,
        role: "CUSTOMER",
      },
    })

    const customer = await prisma.customer.upsert({
      where: { userId: customerUser.id },
      update: {
        phone: CUSTOMER_CREDENTIALS.phone,
        tier: "GOLD",
        pointsBalance: 2450,
        lifetimePoints: 5400,
        lifetimeSpend: 1245,
        totalOrders: 47,
      },
      create: {
        userId: customerUser.id,
        phone: CUSTOMER_CREDENTIALS.phone,
        tier: "GOLD",
        pointsBalance: 2450,
        lifetimePoints: 5400,
        lifetimeSpend: 1245,
        totalOrders: 47,
      },
    })

    await ensureCoffeeProfile(customer.id)
    const productMap = await ensureCatalog(cafe.id)
    await ensureTables(cafe.id)
    const orders = await ensureOrders(customer.id, cafe.id, productMap)
    await ensurePayments(orders)
    await ensureLoyaltyArtifacts(customer.id, cafe.id)

    return NextResponse.json({
      message: "Demo accounts ready",
      owner: {
        email: OWNER_CREDENTIALS.email,
        password: OWNER_CREDENTIALS.password,
      },
      customer: {
        email: CUSTOMER_CREDENTIALS.email,
        password: CUSTOMER_CREDENTIALS.password,
      },
      cafe: {
        slug: cafe.slug,
        name: cafe.name,
      },
    })
  } catch (error) {
    console.error("Demo account setup failed:", error)
    return NextResponse.json({ error: "Failed to create demo accounts" }, { status: 500 })
  }
}

async function ensureCatalog(cafeId: string) {
  const categoryMap: Record<string, { id: string }> = {}

  for (const categorySeed of CATEGORY_SEEDS) {
    const existing = await prisma.category.findFirst({
      where: { cafeId, name: categorySeed.name },
    })

    const category = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: { sortOrder: categorySeed.sortOrder, isActive: true },
        })
      : await prisma.category.create({
          data: {
            cafeId,
            name: categorySeed.name,
            sortOrder: categorySeed.sortOrder,
          },
        })

    categoryMap[categorySeed.name] = { id: category.id }
  }

  const productMap: Record<string, { id: string }> = {}

  for (const productSeed of PRODUCT_SEEDS) {
    const categoryId = categoryMap[productSeed.category]?.id
    if (!categoryId) continue

    const existing = await prisma.product.findFirst({
      where: { cafeId, name: productSeed.name },
    })

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            description: productSeed.description,
            price: productSeed.price,
            isActive: true,
            isPopular: productSeed.isPopular ?? false,
            roastLevel: productSeed.roastLevel as any,
            flavorNotes: productSeed.flavorNotes || [],
            categoryId,
          },
        })
      : await prisma.product.create({
          data: {
            cafeId,
            categoryId,
            name: productSeed.name,
            description: productSeed.description,
            price: productSeed.price,
            isPopular: productSeed.isPopular ?? false,
            roastLevel: productSeed.roastLevel as any,
            flavorNotes: productSeed.flavorNotes || [],
          },
        })

    productMap[productSeed.name] = { id: product.id }
  }

  await ensureProductModifiers(productMap)
  return productMap
}

async function ensureProductModifiers(productMap: Record<string, { id: string }>) {
  const flatWhiteId = productMap["Flat White"]?.id
  if (!flatWhiteId) return

  const modifierCount = await prisma.productModifier.count({
    where: { productId: flatWhiteId },
  })

  if (modifierCount > 0) return

  const milkModifier = await prisma.productModifier.create({
    data: {
      productId: flatWhiteId,
      name: "Milk Options",
      required: false,
      maxSelect: 1,
      options: {
        create: [
          { name: "Regular Milk", price: 0, isDefault: true },
          { name: "Oat Milk", price: 2 },
          { name: "Almond Milk", price: 2 },
          { name: "Soy Milk", price: 1.5 },
        ],
      },
    },
  })

  await prisma.productModifier.create({
    data: {
      productId: flatWhiteId,
      name: "Extra Shot",
      required: false,
      maxSelect: 2,
      options: {
        create: [{ name: "Extra Shot", price: 3 }],
      },
    },
  })

  return milkModifier
}

async function ensureTables(cafeId: string) {
  for (const tableSeed of TABLE_SEEDS) {
    const existing = await prisma.table.findFirst({
      where: { cafeId, name: tableSeed.name },
    })

    if (existing) continue

    await prisma.table.create({
      data: {
        cafeId,
        name: tableSeed.name,
        capacity: tableSeed.capacity,
        posX: tableSeed.posX,
        posY: tableSeed.posY,
      },
    })
  }
}

async function ensureOrders(customerId: string, cafeId: string, productMap: Record<string, { id: string }>) {
  const existingOrders = await prisma.order.count({
    where: { customerId },
  })

  if (existingOrders > 0) {
    return prisma.order.findMany({
      where: { customerId },
    })
  }

  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const flatWhiteId = productMap["Flat White"]?.id
  const coldBrewId = productMap["Cold Brew"]?.id
  const avocadoToastId = productMap["Avocado Toast"]?.id
  const oatLatteId = productMap["Oat Latte"]?.id

  const activeOrder = await prisma.order.create({
    data: {
      orderNumber: "T-042",
      cafeId,
      customerId,
      orderType: "PICKUP",
      status: "PREPARING",
      subtotal: 30.0,
      taxAmount: 1.8,
      discountAmount: 0,
      total: 31.8,
      pointsEarned: 32,
      pointsRedeemed: 0,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      items: {
        create: [
          flatWhiteId
            ? {
                productId: flatWhiteId,
                name: "Flat White",
                quantity: 1,
                unitPrice: 16.0,
                modifiers: { milk: "Oat Milk", extraShot: true },
                total: 16.0,
              }
            : undefined,
          avocadoToastId
            ? {
                productId: avocadoToastId,
                name: "Avocado Toast",
                quantity: 1,
                unitPrice: 14.0,
                total: 14.0,
              }
            : undefined,
        ].filter(Boolean) as any,
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "B-118",
      cafeId,
      customerId,
      orderType: "PICKUP",
      status: "COMPLETED",
      subtotal: 28.0,
      taxAmount: 1.68,
      discountAmount: 0,
      total: 29.68,
      pointsEarned: 30,
      pointsRedeemed: 0,
      createdAt: dayAgo,
      completedAt: dayAgo,
      items: {
        create: [
          coldBrewId
            ? {
                productId: coldBrewId,
                name: "Cold Brew",
                quantity: 2,
                unitPrice: 14.0,
                modifiers: { size: "Large" },
                total: 28.0,
              }
            : undefined,
        ].filter(Boolean) as any,
      },
    },
  })

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "C-055",
      cafeId,
      customerId,
      orderType: "DINE_IN",
      status: "COMPLETED",
      subtotal: 45.0,
      taxAmount: 2.7,
      discountAmount: 5.0,
      total: 42.7,
      pointsEarned: 0,
      pointsRedeemed: 500,
      createdAt: threeDaysAgo,
      completedAt: threeDaysAgo,
      items: {
        create: [
          oatLatteId
            ? {
                productId: oatLatteId,
                name: "Oat Latte",
                quantity: 1,
                unitPrice: 17.0,
                total: 17.0,
              }
            : undefined,
          avocadoToastId
            ? {
                productId: avocadoToastId,
                name: "Avocado Toast",
                quantity: 1,
                unitPrice: 28.0,
                modifiers: { extra: "Extra feta" },
                total: 28.0,
              }
            : undefined,
        ].filter(Boolean) as any,
      },
    },
  })

  return [activeOrder, order2, order3]
}

async function ensurePayments(orders: { id: string; total: number }[]) {
  if (!orders.length) return

  const paymentCount = await prisma.payment.count({
    where: { orderId: { in: orders.map((o) => o.id) } },
  })

  if (paymentCount > 0) return

  const paymentData = [
    { orderId: orders[0]?.id, method: "CARD", amount: orders[0]?.total ?? 0, status: "COMPLETED" },
    { orderId: orders[1]?.id, method: "CARD", amount: orders[1]?.total ?? 0, status: "COMPLETED" },
    { orderId: orders[2]?.id, method: "MOBILE", amount: orders[2]?.total ?? 0, status: "COMPLETED" },
  ].filter((p) => p.orderId)

  if (paymentData.length) {
    await prisma.payment.createMany({ data: paymentData as any })
  }
}

async function ensureCoffeeProfile(customerId: string) {
  await prisma.coffeeProfile.upsert({
    where: { customerId },
    update: { ...COFFEE_PROFILE_SEED },
    create: { customerId, ...COFFEE_PROFILE_SEED },
  })
}

async function ensureLoyaltyArtifacts(customerId: string, cafeId: string) {
  const pointTransactions = await prisma.pointTransaction.count({
    where: { customerId },
  })

  if (pointTransactions === 0) {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const transactions = [
      { type: "EARN", points: 1200, desc: "Welcome bonus", date: thirtyDaysAgo },
      { type: "EARN", points: 800, desc: "Orders this month", date: sevenDaysAgo },
      { type: "REDEEM", points: -350, desc: "Redeemed free drink", date: sevenDaysAgo },
      { type: "EARN", points: 800, desc: "Loyalty streak bonus", date: now },
    ]

    let balance = 0
    for (const txn of transactions) {
      balance += txn.points
      await prisma.pointTransaction.create({
        data: {
          customerId,
          cafeId,
          type: txn.type as any,
          points: txn.points,
          balanceAfter: balance,
          description: txn.desc,
          createdAt: txn.date,
        },
      })
    }
  }

  const vouchers = await prisma.voucher.count({
    where: { customerId },
  })

  if (vouchers === 0) {
    const now = new Date()
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    await prisma.voucher.createMany({
      data: [
        {
          customerId,
          code: "FREE-FW-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          type: "FREE_DRINK",
          value: 14,
          pointsCost: 500,
          status: "ACTIVE",
          expiresAt: monthFromNow,
        },
        {
          customerId,
          code: "OFF5-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          type: "FIXED_AMOUNT",
          value: 5,
          pointsCost: 400,
          status: "ACTIVE",
          expiresAt: twoWeeksFromNow,
        },
      ],
    })
  }
}

