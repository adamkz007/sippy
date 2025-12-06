import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "20")
    const cursor = searchParams.get("cursor")

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    if (!customer) {
      return NextResponse.json({ orders: [], hasMore: false })
    }

    // Build where clause
    const where: any = { customerId: customer.id }
    
    if (status === "active") {
      where.status = { in: ["PENDING", "PREPARING", "READY"] }
    } else if (status === "completed") {
      where.status = { in: ["COMPLETED", "CANCELLED"] }
    }

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
        cafe: {
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            image: true,
            address: true,
          },
        },
        payments: {
          select: { method: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    })

    const hasMore = orders.length > limit
    const ordersToReturn = hasMore ? orders.slice(0, limit) : orders

    return NextResponse.json({
      orders: ordersToReturn.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        cafe: order.cafe,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          modifiers: item.modifiers,
          notes: item.notes,
        })),
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        discountAmount: order.discountAmount,
        tipAmount: order.tipAmount,
        total: order.total,
        pointsEarned: order.pointsEarned,
        pointsRedeemed: order.pointsRedeemed,
        notes: order.notes,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        paymentMethod: order.payments[0]?.method,
      })),
      hasMore,
      nextCursor: hasMore ? ordersToReturn[ordersToReturn.length - 1].id : null,
    })
  } catch (error) {
    console.error("Customer orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// Place a new order as customer
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      cafeId, 
      items, 
      orderType = "PICKUP", 
      notes,
      pointsToRedeem = 0,
    } = body

    if (!cafeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "cafeId and items are required" },
        { status: 400 }
      )
    }

    // Get customer
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    })

    // Create customer if doesn't exist
    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId: session.user.id },
      })
    }

    // Verify points if redeeming
    if (pointsToRedeem > 0 && pointsToRedeem > customer.pointsBalance) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      )
    }

    // Get cafe
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
    })

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    )
    const taxAmount = subtotal * cafe.taxRate
    const pointsDiscount = pointsToRedeem / cafe.pointsPerRedemption
    const total = Math.max(0, subtotal + taxAmount - pointsDiscount)
    const pointsEarned = Math.floor(total * cafe.pointsPerDollar)

    // Generate order number
    const orderCount = await prisma.order.count({ where: { cafeId } })
    const prefix = cafe.name.charAt(0).toUpperCase()
    const orderNumber = `${prefix}-${String(orderCount + 1).padStart(3, "0")}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        cafeId,
        customerId: customer.id,
        orderType: orderType as any,
        status: "PENDING",
        subtotal,
        taxAmount,
        discountAmount: pointsDiscount,
        total,
        pointsEarned,
        pointsRedeemed: pointsToRedeem,
        notes,
        items: {
          create: items.map((item: any) => ({
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
        cafe: {
          select: { name: true, slug: true, address: true },
        },
      },
    })

    // Update customer points
    if (pointsToRedeem > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          pointsBalance: { decrement: pointsToRedeem },
        },
      })

      // Record redemption
      await prisma.pointTransaction.create({
        data: {
          customerId: customer.id,
          cafeId,
          orderId: order.id,
          type: "REDEEM",
          points: -pointsToRedeem,
          balanceAfter: customer.pointsBalance - pointsToRedeem,
          description: `Redeemed for order #${orderNumber}`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        pointsEarned: order.pointsEarned,
        cafe: order.cafe,
        estimatedReady: "10-15 min", // TODO: Calculate based on queue
      },
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

