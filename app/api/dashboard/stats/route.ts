import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cafeId = searchParams.get("cafeId")

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get yesterday's date range for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Today's stats
    const todayOrders = await prisma.order.findMany({
      where: {
        cafeId,
        createdAt: { gte: today, lt: tomorrow },
        status: { in: ['COMPLETED', 'READY', 'PREPARING', 'PENDING'] },
      },
      select: {
        total: true,
        subtotal: true,
        customerId: true,
      },
    })

    // Yesterday's stats for comparison
    const yesterdayOrders = await prisma.order.findMany({
      where: {
        cafeId,
        createdAt: { gte: yesterday, lt: today },
        status: { in: ['COMPLETED', 'READY', 'PREPARING', 'PENDING'] },
      },
      select: {
        total: true,
      },
    })

    // Calculate stats
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const todayOrderCount = todayOrders.length
    const avgTicket = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0
    const uniqueCustomers = new Set(todayOrders.filter(o => o.customerId).map(o => o.customerId)).size

    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0)
    const yesterdayOrderCount = yesterdayOrders.length

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0
    const ordersChange = yesterdayOrderCount > 0 
      ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100 
      : 0

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { cafeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        items: true,
      },
    })

    // Get top products today
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: {
          cafeId,
          createdAt: { gte: today, lt: tomorrow },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        todayRevenue,
        todayOrders: todayOrderCount,
        avgTicket,
        activeCustomers: uniqueCustomers,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        ordersChange: parseFloat(ordersChange.toFixed(1)),
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer?.user?.name || 'Guest',
        items: order.items.length,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
      topProducts: topProducts.map(p => ({
        name: p.name,
        orders: p._sum.quantity || 0,
        revenue: p._sum.total || 0,
      })),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

