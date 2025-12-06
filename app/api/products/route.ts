import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const createProductSchema = z.object({
  cafeId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  roastLevel: z.enum(["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).optional(),
  origin: z.string().optional(),
  flavorNotes: z.array(z.string()).default([]),
})

const updateProductSchema = z.object({
  id: z.string(),
  categoryId: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  cost: z.number().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  roastLevel: z.enum(["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).optional().nullable(),
  origin: z.string().optional().nullable(),
  flavorNotes: z.array(z.string()).optional(),
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
            options: {
              orderBy: { createdAt: 'asc' }
            },
          },
          orderBy: { createdAt: 'asc' }
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
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

    // Get the highest sortOrder for this category
    const maxSortOrder = await prisma.product.aggregate({
      where: { categoryId: data.categoryId },
      _max: { sortOrder: true },
    })

    const product = await prisma.product.create({
      data: {
        ...data,
        sortOrder: data.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
      include: {
        category: true,
        modifiers: {
          include: {
            options: true,
          },
        },
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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = updateProductSchema.parse(body)

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        modifiers: {
          include: {
            options: true,
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Product update error:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Check if product has been used in orders
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItemCount > 0) {
      // Soft delete by deactivating instead of hard delete
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
        include: {
          category: true,
          modifiers: {
            include: {
              options: true,
            },
          },
        },
      })
      return NextResponse.json({ 
        ...product, 
        message: "Product has been deactivated as it has order history" 
      })
    }

    // Hard delete if no order history
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
