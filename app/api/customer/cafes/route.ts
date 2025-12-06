import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const city = searchParams.get("city")
    const limit = parseInt(searchParams.get("limit") || "20")
    const featured = searchParams.get("featured") === "true"

    // Build where clause
    const where: any = { isActive: true }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ]
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" }
    }

    // Get cafes
    const cafes = await prisma.cafe.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        address: true,
        city: true,
        phone: true,
        timezone: true,
        pointsPerDollar: true,
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      orderBy: [
        { orders: { _count: "desc" } }, // Popular first
        { name: "asc" },
      ],
      take: limit,
    })

    // Add mock data for features we haven't implemented yet
    const enrichedCafes = cafes.map((cafe) => ({
      id: cafe.id,
      name: cafe.name,
      slug: cafe.slug,
      description: cafe.description,
      image: cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
      address: cafe.address,
      city: cafe.city,
      phone: cafe.phone,
      // Mock data - would come from business hours/real calculations
      rating: 4.5 + Math.random() * 0.4,
      reviewCount: Math.floor(Math.random() * 300) + 50,
      distance: `${(Math.random() * 2).toFixed(1)} km`,
      prepTime: `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5) + 10} min`,
      isOpen: Math.random() > 0.2, // 80% chance of being open
      closesAt: "5:00 PM",
      priceRange: "$$",
      tags: ["Specialty", "Single Origin"].slice(0, Math.floor(Math.random() * 2) + 1),
      features: ["wifi", "card"].slice(0, Math.floor(Math.random() * 2) + 1),
      pointsPerDollar: cafe.pointsPerDollar,
      stats: {
        totalOrders: cafe._count.orders,
        menuItems: cafe._count.products,
      },
    }))

    return NextResponse.json({
      cafes: enrichedCafes,
      total: cafes.length,
    })
  } catch (error) {
    console.error("Cafes fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cafes" },
      { status: 500 }
    )
  }
}

