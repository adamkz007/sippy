import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

function getTimeFilter(timeframe?: string) {
  const tf = timeframe?.toUpperCase()
  const now = new Date()
  switch (tf) {
    case "TODAY": {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return { gte: start }
    }
    case "LAST_12_HOURS": {
      const start = new Date(now.getTime() - 12 * 60 * 60 * 1000)
      return { gte: start }
    }
    case "LAST_3_HOURS": {
      const start = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      return { gte: start }
    }
    case "THIS_WEEK": {
      const start = new Date()
      const day = start.getDay() || 7 // Sunday => 7
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - (day - 1))
      return { gte: start }
    }
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { gte: start }
    }
    default:
      return undefined
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
    const timeframe = searchParams.get("timeframe") || "ALL"

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    const timeFilter = getTimeFilter(timeframe)

    const orders = await prisma.order.findMany({
      where: {
        cafeId,
        ...(status && status !== "ALL" && { status: status as any }),
        ...(timeFilter && { createdAt: timeFilter }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        items: {
          select: {
            name: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
      },
    })

    // Get order counts by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { 
        cafeId,
        ...(timeFilter && { createdAt: timeFilter }),
      },
      _count: true,
    })

    const counts = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
    statusCounts.forEach(s => {
      counts[s.status as keyof typeof counts] = s._count
    })

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer?.user?.name || null,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        total: order.total,
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt,
      })),
      counts,
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// Update order status
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

