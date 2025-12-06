import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Revenue stats
    const [totalRevenue, thisMonthRevenue, lastMonthRevenue, totalOrders, thisMonthOrders, completedOrders] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _avg: { total: true },
        where: { status: "COMPLETED" },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
    ])

    // Payment methods breakdown
    const payments = await prisma.payment.groupBy({
      by: ["method"],
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    })

    const totalPaymentAmount = payments.reduce((sum, p) => sum + (p._sum.amount || 0), 0)
    
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      mobile: 0,
      cashPercentage: 0,
      cardPercentage: 0,
      mobilePercentage: 0,
    }

    payments.forEach((p) => {
      const amount = p._sum.amount || 0
      const percentage = totalPaymentAmount > 0 ? (amount / totalPaymentAmount) * 100 : 0
      
      switch (p.method) {
        case "CASH":
          paymentBreakdown.cash = amount
          paymentBreakdown.cashPercentage = percentage
          break
        case "CARD":
          paymentBreakdown.card = amount
          paymentBreakdown.cardPercentage = percentage
          break
        case "MOBILE":
        case "VOUCHER":
          paymentBreakdown.mobile += amount
          paymentBreakdown.mobilePercentage += percentage
          break
      }
    })

    // Top cafes by revenue
    const topCafes = await prisma.cafe.findMany({
      select: {
        id: true,
        name: true,
        orders: {
          where: { status: "COMPLETED" },
          select: { total: true },
        },
        _count: { select: { orders: true } },
      },
      take: 5,
    })

    const topCafesWithRevenue = topCafes
      .map((cafe) => ({
        id: cafe.id,
        name: cafe.name,
        revenue: cafe.orders.reduce((sum, o) => sum + o.total, 0),
        orders: cafe._count.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Monthly revenue for last 6 months
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [revenueAgg, orderCount] = await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: { 
            status: "COMPLETED",
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.order.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        }),
      ])
      
      monthlyRevenue.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        revenue: revenueAgg._sum.total || 0,
        orders: orderCount,
      })
    }

    const lastMonthRev = lastMonthRevenue._sum.total || 0
    const thisMonthRev = thisMonthRevenue._sum.total || 0
    const growth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.total || 0,
        thisMonth: thisMonthRev,
        lastMonth: lastMonthRev,
        growth: Math.round(growth * 10) / 10,
      },
      orders: {
        total: totalOrders,
        thisMonth: thisMonthOrders,
        averageValue: totalRevenue._avg.total || 0,
        completedRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      },
      payments: paymentBreakdown,
      topCafes: topCafesWithRevenue,
      monthlyRevenue,
    })
  } catch (error) {
    console.error("Failed to fetch financial stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

