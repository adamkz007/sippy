import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().min(8, "Phone number is required"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, phone } = registerSchema.parse(body)

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

    // Create user with customer profile
    const passwordHash = await hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: "CUSTOMER",
        customer: {
          create: {
            phone,
          },
        },
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        customerId: user.customer?.id,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

