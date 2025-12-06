import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Test database connection and measure latency
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - startTime

    // Get record counts
    const [usersCount, cafesCount, ordersCount, productsCount] = await Promise.all([
      prisma.user.count(),
      prisma.cafe.count(),
      prisma.order.count(),
      prisma.product.count(),
    ])

    // Simulated services status (in real app, would check actual services)
    const services = [
      {
        name: "Authentication Service",
        status: "healthy" as const,
        uptime: "99.99%",
        lastChecked: new Date().toLocaleTimeString(),
      },
      {
        name: "Payment Service",
        status: "healthy" as const,
        uptime: "99.95%",
        lastChecked: new Date().toLocaleTimeString(),
      },
      {
        name: "Notification Service",
        status: "healthy" as const,
        uptime: "99.90%",
        lastChecked: new Date().toLocaleTimeString(),
      },
      {
        name: "Analytics Service",
        status: "healthy" as const,
        uptime: "99.85%",
        lastChecked: new Date().toLocaleTimeString(),
      },
    ]

    return NextResponse.json({
      database: {
        status: dbLatency < 100 ? "healthy" : dbLatency < 500 ? "degraded" : "down",
        latency: dbLatency,
        connections: 5, // In real app, would query actual connection count
      },
      services,
      stats: {
        totalRecords: {
          users: usersCount,
          cafes: cafesCount,
          orders: ordersCount,
          products: productsCount,
        },
        storageUsed: "Calculating...", // Would integrate with actual storage metrics
      },
    })
  } catch (error) {
    console.error("Failed to fetch system status:", error)
    return NextResponse.json({ 
      database: { status: "down", latency: 0, connections: 0 },
      services: [],
      stats: { totalRecords: { users: 0, cafes: 0, orders: 0, products: 0 }, storageUsed: "N/A" },
    })
  }
}

