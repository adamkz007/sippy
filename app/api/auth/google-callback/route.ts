import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// This route handles setting up user profiles after Google OAuth
const setupSchema = z.object({
  email: z.string().email(),
  accountType: z.enum(["customer", "cafe"]),
  name: z.string().optional(),
  image: z.string().optional(),
  // Cafe-specific fields
  cafeName: z.string().optional(),
  cafeSlug: z.string().optional(),
  cafeAddress: z.string().optional(),
  cafeCity: z.string().optional().nullable(),
  cafeLatitude: z.number().optional().nullable(),
  cafeLongitude: z.number().optional().nullable(),
  cafePlaceId: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = setupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        customer: true,
        staffProfiles: {
          include: { cafe: true },
        },
      },
    })

    if (existingUser) {
      if ((!existingUser.name && data.name) || (!existingUser.image && data.image)) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            ...(!existingUser.name && data.name ? { name: data.name } : {}),
            ...(!existingUser.image && data.image ? { image: data.image } : {}),
          },
        })
      }

      // User exists, check if they need profile setup
      if (data.accountType === "customer" && !existingUser.customer) {
        // Create customer profile for existing user
        await prisma.customer.create({
          data: {
            userId: existingUser.id,
          },
        })
      } else if (data.accountType === "cafe" && existingUser.staffProfiles.length === 0) {
        if (!data.cafeName || !data.cafeSlug) {
          return NextResponse.json(
            { error: "Cafe name and slug are required for cafe accounts" },
            { status: 400 }
          )
        }

        if (!data.cafeAddress) {
          return NextResponse.json(
            { error: "Cafe address is required for customers to find your cafe" },
            { status: 400 }
          )
        }

        // Check if slug is unique
        const existingCafe = await prisma.cafe.findUnique({
          where: { slug: data.cafeSlug },
        })

        if (existingCafe) {
          return NextResponse.json(
            { error: "Cafe slug already taken" },
            { status: 400 }
          )
        }

        // Create cafe and staff profile for existing user
        await prisma.$transaction(async (tx) => {
          const cafe = await tx.cafe.create({
            data: {
              name: data.cafeName!,
              slug: data.cafeSlug!,
              email: existingUser.email,
              address: data.cafeAddress!,
              city: data.cafeCity || null,
              latitude: data.cafeLatitude || null,
              longitude: data.cafeLongitude || null,
              placeId: data.cafePlaceId || null,
            },
          })

          await tx.user.update({
            where: { id: existingUser.id },
            data: { role: "OWNER" },
          })

          await tx.staffProfile.create({
            data: {
              userId: existingUser.id,
              cafeId: cafe.id,
              role: "OWNER",
            },
          })
        })
      }

      return NextResponse.json({ success: true, type: "existing" })
    }

    // Create new user with appropriate profile
    if (data.accountType === "customer") {
      await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          role: "CUSTOMER",
          customer: {
            create: {},
          },
        },
      })
    } else if (data.accountType === "cafe") {
      if (!data.cafeName || !data.cafeSlug) {
        return NextResponse.json(
          { error: "Cafe name and slug are required for cafe accounts" },
          { status: 400 }
        )
      }

      if (!data.cafeAddress) {
        return NextResponse.json(
          { error: "Cafe address is required for customers to find your cafe" },
          { status: 400 }
        )
      }

      // Check if slug is unique
      const existingCafe = await prisma.cafe.findUnique({
        where: { slug: data.cafeSlug },
      })

      if (existingCafe) {
        return NextResponse.json(
          { error: "Cafe slug already taken" },
          { status: 400 }
        )
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            name: data.name,
            image: data.image,
            role: "OWNER",
          },
        })

        const cafe = await tx.cafe.create({
          data: {
            name: data.cafeName!,
            slug: data.cafeSlug!,
            email: data.email,
            address: data.cafeAddress!,
            city: data.cafeCity || null,
            latitude: data.cafeLatitude || null,
            longitude: data.cafeLongitude || null,
            placeId: data.cafePlaceId || null,
          },
        })

        await tx.staffProfile.create({
          data: {
            userId: user.id,
            cafeId: cafe.id,
            role: "OWNER",
          },
        })
      })
    }

    return NextResponse.json({ success: true, type: "new" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Google callback error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
