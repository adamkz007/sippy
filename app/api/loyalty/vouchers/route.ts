import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateVoucherCode } from "@/lib/utils"

const claimVoucherSchema = z.object({
  customerId: z.string(),
  type: z.enum(["FREE_DRINK", "PERCENTAGE_OFF", "FIXED_AMOUNT", "FREE_UPGRADE"]),
  value: z.number(),
  pointsCost: z.number(),
})

// Voucher catalog - could be in DB but simpler for now
const voucherCatalog = [
  { type: "FREE_DRINK", name: "Free Coffee", value: 5.50, pointsCost: 500, description: "Any coffee up to $5.50" },
  { type: "FIXED_AMOUNT", name: "$5 Off", value: 5, pointsCost: 400, description: "$5 off any order" },
  { type: "FIXED_AMOUNT", name: "$10 Off", value: 10, pointsCost: 750, description: "$10 off any order" },
  { type: "PERCENTAGE_OFF", name: "15% Off", value: 15, pointsCost: 600, description: "15% off entire order" },
  { type: "FREE_UPGRADE", name: "Free Size Upgrade", value: 1, pointsCost: 200, description: "Free upgrade to large" },
]

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")

    // Return catalog if no customer
    if (!customerId) {
      return NextResponse.json({ catalog: voucherCatalog })
    }

    // Return customer's vouchers
    const vouchers = await prisma.voucher.findMany({
      where: {
        customerId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: "asc" },
    })

    return NextResponse.json({ vouchers, catalog: voucherCatalog })
  } catch (error) {
    console.error("Vouchers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
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
    const data = claimVoucherSchema.parse(body)

    // Check customer has enough points
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    })

    if (!customer || customer.pointsBalance < data.pointsCost) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      )
    }

    // Create voucher and deduct points
    const [voucher, updatedCustomer] = await prisma.$transaction([
      prisma.voucher.create({
        data: {
          customerId: data.customerId,
          code: generateVoucherCode(),
          type: data.type,
          value: data.value,
          pointsCost: data.pointsCost,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      }),
      prisma.customer.update({
        where: { id: data.customerId },
        data: {
          pointsBalance: { decrement: data.pointsCost },
        },
      }),
    ])

    return NextResponse.json({
      voucher,
      newBalance: updatedCustomer.pointsBalance,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Voucher claim error:", error)
    return NextResponse.json(
      { error: "Failed to claim voucher" },
      { status: 500 }
    )
  }
}

