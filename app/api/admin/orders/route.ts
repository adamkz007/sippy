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
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")

    const where: any = {}
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

