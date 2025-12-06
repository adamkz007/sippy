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
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (filter === "customers") {
      where.customer = { isNot: null }
      where.staffProfiles = { none: {} }
    } else if (filter === "staff") {
      where.staffProfiles = { some: { role: { in: ["BARISTA", "CASHIER", "MANAGER"] } } }
    } else if (filter === "owners") {
      where.staffProfiles = { some: { role: "OWNER" } }
    }

    const users = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            tier: true,
            pointsBalance: true,
            lifetimeSpend: true,
            totalOrders: true,
          },
        },
        staffProfiles: {
          include: {
            cafe: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: { isActive: true },
        },
      },
    })

    // Get stats
    const [totalUsers, totalCustomers, totalStaff, totalOwners] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.staffProfile.count({ 
        where: { 
          isActive: true, 
          role: { in: ["BARISTA", "CASHIER", "MANAGER"] } 
        } 
      }),
      prisma.staffProfile.count({ 
        where: { isActive: true, role: "OWNER" } 
      }),
    ])

    return NextResponse.json({ 
      users,
      stats: {
        total: totalUsers,
        customers: totalCustomers,
        staff: totalStaff,
        owners: totalOwners,
      },
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

