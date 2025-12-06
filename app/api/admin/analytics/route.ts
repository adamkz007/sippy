import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "30d"
    
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Daily orders
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        total: true,
        createdAt: true,
        orderType: true,
        status: true,
      },
    })

    // Group by date
    const dailyOrders: { [key: string]: { count: number; revenue: number } } = {}
    const hourlyDistribution: { [key: number]: number } = {}
    const ordersByType: { [key: string]: number } = {}
    
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0]
      const hour = order.createdAt.getHours()
      
      if (!dailyOrders[dateKey]) {
        dailyOrders[dateKey] = { count: 0, revenue: 0 }
      }
      dailyOrders[dateKey].count++
      if (order.status === "COMPLETED") {
        dailyOrders[dateKey].revenue += order.total
      }
      
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1
      ordersByType[order.orderType] = (ordersByType[order.orderType] || 0) + 1
    })

    const totalOrdersCount = orders.length

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["name"],
      _count: true,
      _sum: { total: true },
      where: { order: { createdAt: { gte: startDate } } },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    })

    // Customer growth
    const customerGrowth: { month: string; newCustomers: number; totalCustomers: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [newCustomers, totalCustomers] = await Promise.all([
        prisma.customer.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        }),
        prisma.customer.count({
          where: { createdAt: { lte: monthEnd } },
        }),
      ])
      
      customerGrowth.push({
        month: monthStart.toLocaleString("default", { month: "short", year: "2-digit" }),
        newCustomers,
        totalCustomers,
      })
    }

    // Conversion metrics
    const totalCustomers = await prisma.customer.count()
    const customersWithOrders = await prisma.customer.count({
      where: { totalOrders: { gt: 0 } },
    })
    const repeatCustomers = await prisma.customer.count({
      where: { totalOrders: { gt: 1 } },
    })
    
    const totalOrdersForCustomers = await prisma.order.count({
      where: { customerId: { not: null } },
    })

    return NextResponse.json({
      dailyOrders: Object.entries(dailyOrders)
        .map(([date, data]) => ({
          date,
          count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      
      hourlyDistribution: Object.entries(hourlyDistribution)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
        .sort((a, b) => a.hour - b.hour),
      
      topProducts: topProducts.map((p) => ({
        name: p.name,
        count: p._count,
        revenue: p._sum.total || 0,
      })),
      
      ordersByType: Object.entries(ordersByType).map(([type, count]) => ({
        type,
        count,
        percentage: totalOrdersCount > 0 ? (count / totalOrdersCount) * 100 : 0,
      })),
      
      customerGrowth,
      
      conversionMetrics: {
        browseToOrder: totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0,
        repeatCustomerRate: customersWithOrders > 0 ? (repeatCustomers / customersWithOrders) * 100 : 0,
        avgOrdersPerCustomer: customersWithOrders > 0 ? totalOrdersForCustomers / customersWithOrders : 0,
      },
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

