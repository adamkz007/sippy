import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with customer profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customer: {
          include: {
            coffeeProfile: true,
            vouchers: {
              where: {
                status: "ACTIVE",
                expiresAt: { gt: new Date() },
              },
              orderBy: { expiresAt: "asc" },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if ((!user.name && session.user.name) || (!user.image && session.user.image)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(!user.name && session.user.name ? { name: session.user.name } : {}),
          ...(!user.image && session.user.image ? { image: session.user.image } : {}),
        },
      })
    }

    // If user doesn't have a customer profile, create one
    let customer = user.customer
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: user.id,
          phone: user.phone,
        },
        include: {
          coffeeProfile: true,
          vouchers: {
            where: {
              status: "ACTIVE",
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
    }

    // Get recent orders count
    const orderStats = await prisma.order.aggregate({
      where: { customerId: customer.id },
      _count: true,
    })

    // Get favorite cafes count
    const favoriteCount = 3 // TODO: Implement favorites table

    return NextResponse.json({
      id: customer.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
      loyalty: {
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        lifetimePoints: customer.lifetimePoints,
        lifetimeSpend: customer.lifetimeSpend,
      },
      coffeeProfile: customer.coffeeProfile,
      vouchers: customer.vouchers,
      stats: {
        totalOrders: orderStats._count,
        favoriteCafes: favoriteCount,
      },
      memberSince: customer.createdAt,
    })
  } catch (error) {
    console.error("Customer profile error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
    })

    // Update customer phone if provided
    if (phone) {
      await prisma.customer.updateMany({
        where: { userId: session.user.id },
        data: { phone },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
