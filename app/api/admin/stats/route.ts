import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Fetch all stats in parallel
    const [
      totalCafes,
      activeCafes,
      newCafesThisMonth,
      totalUsers,
      totalCustomers,
      totalStaff,
      newUsersThisMonth,
      totalOrders,
      ordersThisMonth,
      revenueAgg,
      revenueThisMonth,
      revenueLastMonth,
      totalPointsBalance,
      totalVouchers,
      activeVouchers,
    ] = await Promise.all([
      prisma.cafe.count(),
      prisma.cafe.count({ where: { isActive: true } }),
      prisma.cafe.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count(),
      prisma.customer.count(),
      prisma.staffProfile.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        _avg: { total: true },
        where: { status: "COMPLETED" },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: "COMPLETED",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.customer.aggregate({
        _sum: { pointsBalance: true },
      }),
      prisma.voucher.count(),
      prisma.voucher.count({ where: { status: "ACTIVE" } }),
    ])

    const totalRevenue = revenueAgg._sum.total || 0
    const avgOrderValue = revenueAgg._avg.total || 0
    const thisMonthRevenue = revenueThisMonth._sum.total || 0
    const lastMonthRevenue = revenueLastMonth._sum.total || 0
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    return NextResponse.json({
      cafes: {
        total: totalCafes,
        active: activeCafes,
        newThisMonth: newCafesThisMonth,
      },
      users: {
        total: totalUsers,
        customers: totalCustomers,
        staff: totalStaff,
        newThisMonth: newUsersThisMonth,
      },
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
        averageValue: avgOrderValue,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        growth: Math.round(revenueGrowth * 10) / 10,
      },
      loyalty: {
        totalPoints: totalPointsBalance._sum.pointsBalance || 0,
        totalVouchers,
        activeVouchers,
      },
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

