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
    const days = parseInt(searchParams.get("days") || "7")

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    // Date ranges
    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - days)
    periodStart.setHours(0, 0, 0, 0)
    
    const previousPeriodStart = new Date(periodStart)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    // Current period stats
    const currentOrders = await prisma.order.findMany({
      where: {
        cafeId,
        createdAt: { gte: periodStart },
        status: { in: ['COMPLETED', 'READY', 'PREPARING', 'PENDING'] },
      },
      select: {
        total: true,
        customerId: true,
        createdAt: true,
      },
    })

    // Previous period stats for comparison
    const previousOrders = await prisma.order.findMany({
      where: {
        cafeId,
        createdAt: { gte: previousPeriodStart, lt: periodStart },
        status: { in: ['COMPLETED', 'READY', 'PREPARING', 'PENDING'] },
      },
      select: {
        total: true,
      },
    })

    // Calculate period stats
    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0)
    const currentOrderCount = currentOrders.length
    const currentAvgTicket = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
    const currentCustomers = new Set(currentOrders.filter(o => o.customerId).map(o => o.customerId)).size

    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0)
    const previousOrderCount = previousOrders.length
    const previousAvgTicket = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0

    // Hourly breakdown for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayOrders = await prisma.order.findMany({
      where: {
        cafeId,
        createdAt: { gte: today, lt: tomorrow },
      },
      select: {
        total: true,
        createdAt: true,
      },
    })

    // Group by hour
    const hourlyData: { hour: string; orders: number; revenue: number }[] = []
    for (let h = 6; h <= 17; h++) {
      const hourLabel = h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`
      const ordersInHour = todayOrders.filter(o => {
        const hour = new Date(o.createdAt).getHours()
        return hour === h
      })
      hourlyData.push({
        hour: hourLabel,
        orders: ordersInHour.length,
        revenue: ordersInHour.reduce((sum, o) => sum + o.total, 0),
      })
    }

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: {
          cafeId,
          createdAt: { gte: periodStart },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 5,
    })

    // Get previous period data for top products growth
    const prevTopProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          cafeId,
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      },
      _sum: {
        total: true,
      },
    })

    const prevProductMap = new Map(prevTopProducts.map(p => [p.productId, p._sum.total || 0]))

    // Customer insights
    const totalCustomers = await prisma.customer.count({
      where: {
        orders: { some: { cafeId } },
      },
    })

    // Repeat customers = customers with more than one order at this cafe
    const repeatCustomerGroups = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        cafeId,
        customerId: { not: null },
      },
      _count: {
        customerId: true,
      },
      having: {
        customerId: {
          _count: { gt: 1 },
        },
      },
    })
    const repeatCustomers = repeatCustomerGroups.length

    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0

    return NextResponse.json({
      periodStats: {
        revenue: { current: currentRevenue, previous: previousRevenue },
        orders: { current: currentOrderCount, previous: previousOrderCount },
        avgTicket: { current: currentAvgTicket, previous: previousAvgTicket },
        customers: { current: currentCustomers, previous: 0 },
      },
      hourlyData,
      topProducts: topProducts.map(p => {
        const prevRevenue = prevProductMap.get(p.productId) || 0
        const currentRevenue = p._sum.total || 0
        const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
        
        return {
          name: p.name,
          orders: p._sum.quantity || 0,
          revenue: currentRevenue,
          growth: Math.round(growth),
        }
      }),
      customerInsights: [
        { label: "Repeat Rate", value: `${repeatRate.toFixed(0)}%`, change: 0 },
        { label: "Total Customers", value: totalCustomers.toString(), change: 0 },
        { label: "Period Orders", value: currentOrderCount.toString(), change: 0 },
        { label: "Avg. Order Value", value: currentAvgTicket.toFixed(2), change: 0 },
      ],
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

