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

    // Get total points issued at this cafe
    const pointsIssued = await prisma.pointTransaction.aggregate({
      where: {
        cafeId,
        type: 'EARN',
      },
      _sum: {
        points: true,
      },
    })

    // Get total points redeemed at this cafe
    const pointsRedeemed = await prisma.pointTransaction.aggregate({
      where: {
        cafeId,
        type: 'REDEEM',
      },
      _sum: {
        points: true,
      },
    })

    // Get active vouchers count
    const activeVouchers = await prisma.voucher.count({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
        customer: {
          orders: { some: { cafeId } },
        },
      },
    })

    // Get recent redemptions at this cafe
    const recentRedemptions = await prisma.pointTransaction.findMany({
      where: {
        cafeId,
        type: 'REDEEM',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    })

    // Voucher catalog stats - count by type
    const voucherStats = await prisma.voucher.groupBy({
      by: ['type'],
      where: {
        customer: {
          orders: { some: { cafeId } },
        },
      },
      _count: true,
    })

    return NextResponse.json({
      stats: {
        totalPointsIssued: Math.abs(pointsIssued._sum.points || 0),
        totalPointsRedeemed: Math.abs(pointsRedeemed._sum.points || 0),
        activeVouchers,
        crossCafeRedemptions: 0, // Would need more complex query for cross-cafe
      },
      recentRedemptions: recentRedemptions.map(r => ({
        customer: r.customer.user.name || 'Customer',
        points: Math.abs(r.points),
        description: r.description,
        time: r.createdAt,
      })),
      voucherStats: voucherStats.map(v => ({
        type: v.type,
        count: v._count,
      })),
    })
  } catch (error) {
    console.error("Loyalty stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch loyalty stats" },
      { status: 500 }
    )
  }
}

