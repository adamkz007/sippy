import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.coffeeProfile.findUnique({
      where: { customerId: params.customerId },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get recommendations based on profile
    const recommendations = await getRecommendations(profile)

    return NextResponse.json({
      profile,
      recommendations,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

async function getRecommendations(profile: any) {
  // Get products that match the profile
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      // Match roast level if profile prefers dark/light
      ...(profile.roastPreference >= 4 && {
        roastLevel: { in: ["DARK", "MEDIUM_DARK"] },
      }),
      ...(profile.roastPreference <= 2 && {
        roastLevel: { in: ["LIGHT", "MEDIUM_LIGHT"] },
      }),
    },
    take: 5,
    include: {
      category: true,
    },
  })

  // Generate personalized recommendations
  const recommendations: any[] = [
    {
      type: "based_on_profile",
      title: `Perfect for a ${profile.profileType}`,
      products: products.slice(0, 3),
    },
  ]

  // Add temperature-based recommendation
  if (profile.temperature <= 2.5) {
    const coldDrinks = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: "Cold", mode: "insensitive" },
      },
      take: 3,
      include: {
        category: true,
      },
    })
    if (coldDrinks.length > 0) {
      recommendations.push({
        type: "temperature",
        title: "Cold drinks you might love",
        products: coldDrinks,
      })
    }
  }

  return recommendations
}

