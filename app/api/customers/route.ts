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
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        coffeeProfile: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { lifetimeSpend: "desc" },
      take: limit,
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

