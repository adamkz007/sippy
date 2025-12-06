import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const modifierOptionSchema = z.object({
  id: z.string().optional(), // For updates
  name: z.string().min(1),
  price: z.number().default(0),
  isDefault: z.boolean().default(false),
})

const createModifierSchema = z.object({
  productId: z.string(),
  name: z.string().min(1),
  required: z.boolean().default(false),
  maxSelect: z.number().int().min(1).default(1),
  options: z.array(modifierOptionSchema).min(1),
})

const updateModifierSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  required: z.boolean().optional(),
  maxSelect: z.number().int().min(1).optional(),
  options: z.array(modifierOptionSchema).optional(),
})

// GET - List modifiers for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const modifiers = await prisma.productModifier.findMany({
      where: { productId },
      include: {
        options: {
          orderBy: { createdAt: 'asc' }
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(modifiers)
  } catch (error) {
    console.error("Modifiers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch modifiers" },
      { status: 500 }
    )
  }
}

// POST - Create a new modifier with options
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { options, ...modifierData } = createModifierSchema.parse(body)

    const modifier = await prisma.productModifier.create({
      data: {
        ...modifierData,
        options: {
          create: options.map(opt => ({
            name: opt.name,
            price: opt.price,
            isDefault: opt.isDefault,
          })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(modifier)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Modifier creation error:", error)
    return NextResponse.json(
      { error: "Failed to create modifier" },
      { status: 500 }
    )
  }
}

// PATCH - Update a modifier and its options
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, options, ...modifierData } = updateModifierSchema.parse(body)

    // Update modifier in a transaction
    const modifier = await prisma.$transaction(async (tx) => {
      // Update base modifier data
      const updatedModifier = await tx.productModifier.update({
        where: { id },
        data: modifierData,
      })

      // If options are provided, sync them
      if (options) {
        // Get existing option IDs
        const existingOptions = await tx.modifierOption.findMany({
          where: { modifierId: id },
          select: { id: true },
        })
        const existingIds = existingOptions.map(o => o.id)
        const newOptionIds = options.filter(o => o.id).map(o => o.id!)

        // Delete removed options
        const idsToDelete = existingIds.filter(id => !newOptionIds.includes(id))
        if (idsToDelete.length > 0) {
          await tx.modifierOption.deleteMany({
            where: { id: { in: idsToDelete } },
          })
        }

        // Update or create options
        for (const option of options) {
          if (option.id && existingIds.includes(option.id)) {
            // Update existing
            await tx.modifierOption.update({
              where: { id: option.id },
              data: {
                name: option.name,
                price: option.price,
                isDefault: option.isDefault,
              },
            })
          } else {
            // Create new
            await tx.modifierOption.create({
              data: {
                modifierId: id,
                name: option.name,
                price: option.price,
                isDefault: option.isDefault,
              },
            })
          }
        }
      }

      // Return updated modifier with options
      return tx.productModifier.findUnique({
        where: { id },
        include: { options: { orderBy: { createdAt: 'asc' } } },
      })
    })

    return NextResponse.json(modifier)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Modifier update error:", error)
    return NextResponse.json(
      { error: "Failed to update modifier" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a modifier and its options
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Modifier ID is required" }, { status: 400 })
    }

    // Cascade delete will handle options
    await prisma.productModifier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Modifier delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete modifier" },
      { status: 500 }
    )
  }
}

