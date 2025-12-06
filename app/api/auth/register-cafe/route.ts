import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerCafeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  cafeName: z.string().min(2),
  cafeSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  cafeAddress: z.string().min(5, "Address is required"),
  cafeCity: z.string().optional().nullable(),
  cafeLatitude: z.number().optional().nullable(),
  cafeLongitude: z.number().optional().nullable(),
  cafePlaceId: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      email, 
      password, 
      name, 
      phone, 
      cafeName, 
      cafeSlug,
      cafeAddress,
      cafeCity,
      cafeLatitude,
      cafeLongitude,
      cafePlaceId,
    } = registerCafeSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Check if cafe slug is taken
    const existingCafe = await prisma.cafe.findUnique({
      where: { slug: cafeSlug },
    })

    if (existingCafe) {
      return NextResponse.json(
        { error: "Cafe URL is already taken. Please choose another." },
        { status: 400 }
      )
    }

    // Create user with cafe and staff profile in a transaction
    const passwordHash = await hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      // Create the user as OWNER
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role: "OWNER",
        },
      })

      // Create the cafe
      const cafe = await tx.cafe.create({
        data: {
          name: cafeName,
          slug: cafeSlug,
          email,
          phone,
          address: cafeAddress,
          city: cafeCity || null,
          latitude: cafeLatitude || null,
          longitude: cafeLongitude || null,
          placeId: cafePlaceId || null,
        },
      })

      // Create staff profile linking user to cafe as OWNER
      const staffProfile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          cafeId: cafe.id,
          role: "OWNER",
        },
      })

      return { user, cafe, staffProfile }
    })

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      cafe: {
        id: result.cafe.id,
        name: result.cafe.name,
        slug: result.cafe.slug,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error" },
        { status: 400 }
      )
    }

    console.error("Cafe registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

