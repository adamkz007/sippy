import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (filter === "active") {
      where.isActive = true
    } else if (filter === "inactive") {
      where.isActive = false
    }

    const cafes = await prisma.cafe.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            orders: true,
            staff: true,
            products: true,
          },
        },
      },
    })

    // Calculate revenue for each cafe
    const cafesWithRevenue = await Promise.all(
      cafes.map(async (cafe) => {
        const revenueAgg = await prisma.order.aggregate({
          _sum: { total: true },
          where: {
            cafeId: cafe.id,
            status: "COMPLETED",
          },
        })
        
        return {
          ...cafe,
          totalRevenue: revenueAgg._sum.total || 0,
        }
      })
    )

    return NextResponse.json({ cafes: cafesWithRevenue })
  } catch (error) {
    console.error("Failed to fetch cafes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

