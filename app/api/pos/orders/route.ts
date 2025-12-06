import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

interface CreateOrderRequest {
  cafeId: string
  customerId?: string | null
  guestPhone?: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  orderType: "TAKEAWAY" | "DINE_IN"
  paymentMethod: "CARD" | "CASH"
  pointsEarned: number
}

// Generate order number
function generateOrderNumber(): string {
  const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
  const number = Math.floor(1000 + Math.random() * 9000) // 1000-9999
  return `${prefix}-${number}`
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: CreateOrderRequest = await req.json()
    const { 
      cafeId, 
      customerId, 
      guestPhone, 
      items, 
      subtotal, 
      tax, 
      total, 
      orderType, 
      paymentMethod, 
      pointsEarned 
    } = body

    if (!cafeId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    // Get user ID from session (the logged-in staff member's user ID)
    const userId = (session?.user as any)?.id || null

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          cafeId,
          customerId: customerId || null,
          userId,
          status: 'COMPLETED',
          orderType,
          subtotal,
          taxAmount: tax,
          discountAmount: 0,
          total,
          pointsEarned: customerId ? pointsEarned : 0,
          completedAt: new Date(),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      })
      
      // Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          amount: total,
          status: 'COMPLETED',
        },
      })

      // If registered customer, award points
      if (customerId && pointsEarned > 0) {
        // Get current balance
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          select: { pointsBalance: true },
        })
        const currentBalance = customer?.pointsBalance || 0
        const balanceAfter = currentBalance + pointsEarned

        // Create point transaction
        await tx.pointTransaction.create({
          data: {
            customerId,
            cafeId,
            orderId: order.id,
            type: 'EARN',
            points: pointsEarned,
            balanceAfter,
            description: `Earned from order #${order.orderNumber}`,
          },
        })

        // Update customer points balance and stats
        await tx.customer.update({
          where: { id: customerId },
          data: {
            pointsBalance: { set: balanceAfter },
            lifetimePoints: { increment: pointsEarned },
            lifetimeSpend: { increment: total },
          },
        })
      }

      // If guest customer with phone, track for future claim
      // This could create a pending points record or store on the order itself
      // The order already has guestPhone in metadata

      return order
    })

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        total: result.total,
        status: result.status,
        pointsEarned: result.pointsEarned,
      },
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

