import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const cafe = await prisma.cafe.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            products: {
              where: { isActive: true },
              orderBy: [
                { isPopular: "desc" },
                { sortOrder: "asc" },
              ],
              include: {
                modifiers: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    }

    // Format response
    const response = {
      id: cafe.id,
      name: cafe.name,
      slug: cafe.slug,
      description: cafe.description,
      image: cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      address: cafe.address,
      city: cafe.city,
      phone: cafe.phone,
      email: cafe.email,
      timezone: cafe.timezone,
      currency: cafe.currency,
      taxRate: cafe.taxRate,
      // Loyalty settings
      pointsPerDollar: cafe.pointsPerDollar,
      pointsPerRedemption: cafe.pointsPerRedemption,
      // Mock data for features not yet implemented
      rating: 4.7,
      reviewCount: 234,
      distance: "0.3 km",
      prepTime: "5-10 min",
      isOpen: true,
      closesAt: "5:00 PM",
      priceRange: "$$",
      tags: ["Specialty", "Single Origin"],
      features: ["wifi", "card"],
      // Menu
      categories: cafe.categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          isPopular: product.isPopular,
          roastLevel: product.roastLevel,
          origin: product.origin,
          flavorNotes: product.flavorNotes,
          modifiers: product.modifiers.map((modifier) => ({
            id: modifier.id,
            name: modifier.name,
            required: modifier.required,
            maxSelect: modifier.maxSelect,
            options: modifier.options.map((option) => ({
              id: option.id,
              name: option.name,
              price: option.price,
              isDefault: option.isDefault,
            })),
          })),
        })),
      })),
      stats: {
        totalOrders: cafe._count.orders,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Cafe fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cafe" },
      { status: 500 }
    )
  }
}

