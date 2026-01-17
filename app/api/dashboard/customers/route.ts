import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

const normalizePhone = (phone: string) => phone.replace(/[\s\-\(\)]/g, '')

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

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { orders: { some: { cafeId } } },
          { cafeCustomers: { some: { cafeId } } },
        ],
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
        cafeCustomers: {
          where: { cafeId },
          select: { createdAt: true },
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

    const counts = {
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      PLATINUM: 0,
    }

    customers.forEach(c => {
      const key = c.tier as keyof typeof counts
      if (counts[key] !== undefined) counts[key] += 1
    })

    const leadTierKey = "BRONZE" as const
    const leads = await prisma.cafeCustomer.findMany({
      where: {
        cafeId,
        customerId: null,
        phone: { not: null },
        ...(tier ? (tier === leadTierKey ? {} : { id: "__none__" }) : {}),
        ...(search ? { phone: { contains: search } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        createdAt: true,
      },
    })
    counts.BRONZE += leads.length

    // Calculate aggregate stats
    const totalCustomers = customers.length + leads.length
    const totalPoints = customers.reduce((sum, c) => sum + c.pointsBalance, 0)
    const totalLifetimeSpend = customers.reduce((sum, c) => sum + c.lifetimeSpend, 0)
    const avgLifetimeValue = totalCustomers > 0 ? totalLifetimeSpend / totalCustomers : 0

    const customerItems = customers.map(customer => ({
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
      isLead: false,
      lastSeen: (customer.orders[0]?.createdAt || customer.cafeCustomers[0]?.createdAt || customer.updatedAt).toISOString(),
    }))

    const leadItems = leads.map(lead => ({
      id: `lead:${lead.id}`,
      name: "Guest",
      email: null,
      phone: lead.phone,
      image: null,
      tier: "BRONZE",
      pointsBalance: 0,
      lifetimeSpend: 0,
      totalOrders: 0,
      lastOrder: null,
      coffeeProfile: null,
      isLead: true,
      lastSeen: lead.createdAt.toISOString(),
    }))

    const combined = [...customerItems, ...leadItems].sort((a, b) => {
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    })

    return NextResponse.json({
      customers: combined.map(({ lastSeen, ...rest }) => rest),
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const cafeId = body?.cafeId as string | undefined
    const customerId = body?.customerId as string | undefined
    const phoneRaw = body?.phone as string | undefined

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    const staffProfiles = (session.user as any)?.staffProfiles || []
    const hasAccess = staffProfiles.some((sp: any) => sp?.cafeId === cafeId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!customerId && !phoneRaw) {
      return NextResponse.json({ error: "customerId or phone is required" }, { status: 400 })
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } })
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      await prisma.cafeCustomer.upsert({
        where: {
          cafeId_customerId: { cafeId, customerId },
        },
        create: {
          cafeId,
          customerId,
          source: "SCAN",
        },
        update: {},
      })

      return NextResponse.json({ success: true, type: "customer", customerId })
    }

    const phone = normalizePhone(phoneRaw!)
    if (!phone) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: { contains: phone } },
          { user: { phone: { contains: phone } } },
        ],
      },
      select: { id: true },
    })

    if (existingCustomer) {
      await prisma.cafeCustomer.upsert({
        where: {
          cafeId_customerId: { cafeId, customerId: existingCustomer.id },
        },
        create: {
          cafeId,
          customerId: existingCustomer.id,
          source: "PHONE",
        },
        update: {},
      })
      return NextResponse.json({ success: true, type: "customer", customerId: existingCustomer.id })
    }

    await prisma.cafeCustomer.upsert({
      where: {
        cafeId_phone: { cafeId, phone },
      },
      create: {
        cafeId,
        phone,
        source: "PHONE",
      },
      update: {},
    })

    return NextResponse.json({ success: true, type: "lead", phone })
  } catch (error) {
    console.error("Customer record error:", error)
    return NextResponse.json(
      { error: "Failed to record customer" },
      { status: 500 }
    )
  }
}
