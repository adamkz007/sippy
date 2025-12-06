import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Lookup customer by phone number
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Normalize phone number - remove spaces, dashes, and ensure it has proper format
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')

    // Search for customer by phone - check both User.phone and Customer.phone
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: { contains: normalizedPhone } },
          { user: { phone: { contains: normalizedPhone } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        coffeeProfile: {
          select: {
            profileType: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ 
        found: false,
        phone: normalizedPhone,
      })
    }

    return NextResponse.json({
      found: true,
      customer: {
        id: customer.id,
        name: customer.user.name,
        email: customer.user.email,
        phone: customer.phone || customer.user.phone,
        image: customer.user.image,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        lifetimePoints: customer.lifetimePoints,
        lifetimeSpend: customer.lifetimeSpend,
        totalOrders: customer._count.orders,
        profileType: customer.coffeeProfile?.profileType,
      },
    })
  } catch (error) {
    console.error("Customer lookup error:", error)
    return NextResponse.json(
      { error: "Failed to lookup customer" },
      { status: 500 }
    )
  }
}

