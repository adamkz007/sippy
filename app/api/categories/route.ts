import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const createCategorySchema = z.object({
  cafeId: z.string().cuid("Invalid cafeId"),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

// GET - List categories for a cafe
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cafeId = searchParams.get("cafeId")
    const activeOnly = searchParams.get("active") === "true"

    if (!cafeId) {
      return NextResponse.json({ error: "cafeId is required" }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: {
        cafeId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    })

    // Transform to include productCount
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }))

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createCategorySchema.parse(body)

    // Ensure cafe exists and user has access before creating
    const cafe = await prisma.cafe.findUnique({
      where: { id: data.cafeId },
      select: { id: true },
    })

    if (!cafe) {
      return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
    }

    const hasAccess =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPERADMIN" ||
      !!(await prisma.staffProfile.findFirst({
        where: {
          userId: session.user.id,
          cafeId: data.cafeId,
          isActive: true,
        },
        select: { id: true },
      }))

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to manage this cafe" },
        { status: 403 }
      )
    }

    // Get the highest sortOrder for this cafe
    const maxSortOrder = await prisma.category.aggregate({
      where: { cafeId: data.cafeId },
      _max: { sortOrder: true },
    })

    const category = await prisma.category.create({
      data: {
        ...data,
        sortOrder: data.sortOrder || (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json({
      ...category,
      productCount: category._count.products,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    console.error("Category creation error:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

// PATCH - Update a category
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = updateCategorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json({
      ...category,
      productCount: category._count.products,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    console.error("Category update error:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Please move or delete products first." },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Category delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

