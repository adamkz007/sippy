import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

// Get cafe details
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cafeId = searchParams.get("cafeId")

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        placeId: true,
        phone: true,
        email: true,
        timezone: true,
        currency: true,
        taxRate: true,
        isActive: true,
        pointsPerDollar: true,
        pointsPerRedemption: true,
        createdAt: true,
      },
    })

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    }

    return NextResponse.json(cafe)
  } catch (error) {
    console.error("Cafe fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cafe" },
      { status: 500 }
    )
  }
}

const updateCafeSchema = z.object({
  cafeId: z.string(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  placeId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  pointsPerDollar: z.number().int().min(0).optional(),
  pointsPerRedemption: z.number().int().min(1).optional(),
})

// Update cafe details
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { cafeId, ...data } = updateCafeSchema.parse(body)

    // Check if slug is being changed and if it's unique
    if (data.slug) {
      const existingCafe = await prisma.cafe.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: cafeId },
        },
      })
      if (existingCafe) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
      }
    }

    const cafe = await prisma.cafe.update({
      where: { id: cafeId },
      data,
    })

    return NextResponse.json(cafe)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Cafe update error:", error)
    return NextResponse.json(
      { error: "Failed to update cafe" },
      { status: 500 }
    )
  }
}

