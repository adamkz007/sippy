import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createProductSchema = z.object({
  cafeId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  roastLevel: z.enum(["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).optional(),
  origin: z.string().optional(),
  flavorNotes: z.array(z.string()).default([]),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cafeId = searchParams.get("cafeId")
    const categoryId = searchParams.get("categoryId")
    const activeOnly = searchParams.get("active") === "true"

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        cafeId,
        ...(categoryId && { categoryId }),
        ...(activeOnly && { isActive: true }),
      },
      include: {
        category: true,
        modifiers: {
          include: {
            options: true,
          },
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createProductSchema.parse(body)

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

