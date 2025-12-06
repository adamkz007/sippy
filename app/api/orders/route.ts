import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateOrderNumber, calculateLoyaltyTier } from "@/lib/utils"

export const dynamic = 'force-dynamic'

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  modifiers: z.any().optional(),
  notes: z.string().optional(),
})

const createOrderSchema = z.object({
  cafeId: z.string(),
  customerId: z.string().optional(),
  tableId: z.string().optional(),
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "PICKUP", "DELIVERY"]),
  items: z.array(orderItemSchema),
  notes: z.string().optional(),
  pointsRedeemed: z.number().default(0),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createOrderSchema.parse(body)

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )

    // Get cafe tax rate
    const cafe = await prisma.cafe.findUnique({
      where: { id: data.cafeId },
    })

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    }

    const taxAmount = subtotal * cafe.taxRate
    const discountFromPoints = data.pointsRedeemed / cafe.pointsPerRedemption
    const total = subtotal + taxAmount - discountFromPoints

    // Calculate points earned
    const pointsEarned = Math.floor(total * cafe.pointsPerDollar)

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        cafeId: data.cafeId,
        userId: session.user.id,
        customerId: data.customerId,
        tableId: data.tableId,
        orderType: data.orderType,
        status: "PENDING",
        subtotal,
        taxAmount,
        discountAmount: discountFromPoints,
        total,
        pointsEarned,
        pointsRedeemed: data.pointsRedeemed,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            modifiers: item.modifiers,
            notes: item.notes,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Update customer loyalty if applicable
    if (data.customerId && pointsEarned > 0) {
      const customer = await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          pointsBalance: { increment: pointsEarned - data.pointsRedeemed },
          lifetimePoints: { increment: pointsEarned },
          lifetimeSpend: { increment: total },
          totalOrders: { increment: 1 },
        },
      })

      // Create point transaction
      await prisma.pointTransaction.create({
        data: {
          customerId: data.customerId,
          cafeId: data.cafeId,
          orderId: order.id,
          type: "EARN",
          points: pointsEarned,
          balanceAfter: customer.pointsBalance,
          description: `Earned from order #${order.orderNumber}`,
        },
      })

      // Update tier if needed
      const newTier = calculateLoyaltyTier(customer.lifetimePoints)
      if (newTier !== customer.tier) {
        await prisma.customer.update({
          where: { id: data.customerId },
          data: { tier: newTier },
        })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cafeId = searchParams.get("cafeId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    const orders = await prisma.order.findMany({
      where: {
        ...(cafeId && { cafeId }),
        ...(status && { status: status as any }),
      },
      include: {
        items: true,
        customer: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

