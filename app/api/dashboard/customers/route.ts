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
    const tier = searchParams.get("tier")
    const search = searchParams.get("search")

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    // Get customers who have ordered from this cafe
    const customersWithOrders = await prisma.customer.findMany({
      where: {
        orders: {
          some: { cafeId },
        },
        ...(tier && { tier: tier as any }),
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { phone: { contains: search } },
            { user: { phone: { contains: search } } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        coffeeProfile: {
          select: {
            profileType: true,
            roastPreference: true,
            strength: true,
          },
        },
        orders: {
          where: { cafeId },
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            orders: {
              where: { cafeId },
            },
          },
        },
      },
      orderBy: { lifetimeSpend: 'desc' },
    })

    // Get tier counts
    const tierCounts = await prisma.customer.groupBy({
      by: ['tier'],
      where: {
        orders: {
          some: { cafeId },
        },
      },
      _count: true,
    })

    const counts = {
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      PLATINUM: 0,
    }
    tierCounts.forEach(t => {
      counts[t.tier as keyof typeof counts] = t._count
    })

    // Calculate aggregate stats
    const totalCustomers = customersWithOrders.length
    const totalPoints = customersWithOrders.reduce((sum, c) => sum + c.pointsBalance, 0)
    const totalLifetimeSpend = customersWithOrders.reduce((sum, c) => sum + c.lifetimeSpend, 0)
    const avgLifetimeValue = totalCustomers > 0 ? totalLifetimeSpend / totalCustomers : 0

    return NextResponse.json({
      customers: customersWithOrders.map(customer => ({
        id: customer.id,
        name: customer.user.name,
        email: customer.user.email,
        phone: customer.phone || customer.user.phone,
        image: customer.user.image,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        lifetimeSpend: customer.lifetimeSpend,
        totalOrders: customer._count.orders,
        lastOrder: customer.orders[0]?.createdAt || null,
        coffeeProfile: customer.coffeeProfile ? {
          type: customer.coffeeProfile.profileType,
          roast: customer.coffeeProfile.roastPreference,
          strength: customer.coffeeProfile.strength,
        } : null,
      })),
      stats: {
        totalCustomers,
        totalPoints,
        avgLifetimeValue,
        vipCount: counts.PLATINUM + counts.GOLD,
      },
      tierCounts: counts,
    })
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

