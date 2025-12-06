import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const earnPointsSchema = z.object({
  customerId: z.string(),
  cafeId: z.string(),
  orderId: z.string().optional(),
  points: z.number().positive(),
  description: z.string(),
})

const redeemPointsSchema = z.object({
  customerId: z.string(),
  cafeId: z.string(),
  points: z.number().positive(),
  description: z.string(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 })
    }

    const [customer, transactions] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.pointTransaction.findMany({
        where: { customerId },
        include: {
          cafe: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ])

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({
      balance: customer.pointsBalance,
      lifetimePoints: customer.lifetimePoints,
      tier: customer.tier,
      transactions,
    })
  } catch (error) {
    console.error("Points fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch points" },
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
    const { action } = body

    if (action === "earn") {
      const data = earnPointsSchema.parse(body)
      
      const customer = await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          pointsBalance: { increment: data.points },
          lifetimePoints: { increment: data.points },
        },
      })

      await prisma.pointTransaction.create({
        data: {
          customerId: data.customerId,
          cafeId: data.cafeId,
          orderId: data.orderId,
          type: "EARN",
          points: data.points,
          balanceAfter: customer.pointsBalance,
          description: data.description,
        },
      })

      return NextResponse.json({ success: true, newBalance: customer.pointsBalance })
    }

    if (action === "redeem") {
      const data = redeemPointsSchema.parse(body)
      
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      })

      if (!customer || customer.pointsBalance < data.points) {
        return NextResponse.json(
          { error: "Insufficient points" },
          { status: 400 }
        )
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          pointsBalance: { decrement: data.points },
        },
      })

      await prisma.pointTransaction.create({
        data: {
          customerId: data.customerId,
          cafeId: data.cafeId,
          type: "REDEEM",
          points: -data.points,
          balanceAfter: updatedCustomer.pointsBalance,
          description: data.description,
        },
      })

      return NextResponse.json({ success: true, newBalance: updatedCustomer.pointsBalance })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Points operation error:", error)
    return NextResponse.json(
      { error: "Failed to process points" },
      { status: 500 }
    )
  }
}

