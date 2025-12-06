import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

const DEMO_CAFE = {
  id: "demo-cafe",
  name: "The Daily Grind (Demo)",
  slug: "daily-grind",
  description: "Your neighborhood specialty coffee shop serving artisan coffee and fresh pastries",
  image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  address: "168 Jalan Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur",
  city: "Kuala Lumpur",
  latitude: 3.1478,
  longitude: 101.7108,
  phone: "+60 3 2345 6789",
  timezone: "Asia/Kuala_Lumpur",
  pointsPerDollar: 1,
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const city = searchParams.get("city")
    const limit = parseInt(searchParams.get("limit") || "20")
    const featured = searchParams.get("featured") === "true"
    
    // User location parameters
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null
    const maxDistance = searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : null // in km

    // Build where clause - only show cafes with addresses
    const where: any = { 
      isActive: true,
      // address is non-nullable in schema; filter out empty strings instead of null
      address: { not: "" },
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ]
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" }
    }

    // Get cafes
    const cafes = await prisma.cafe.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        address: true,
        city: true,
        latitude: true,
        longitude: true,
        phone: true,
        timezone: true,
        pointsPerDollar: true,
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      take: limit * 2, // Fetch more in case we filter by distance
    })

    // Calculate distances and enrich data
    let enrichedCafes = cafes.map((cafe) => {
      let distance: number | null = null
      let distanceText = "Unknown"

      // Calculate distance if user location and cafe location are available
      if (userLat !== null && userLng !== null && cafe.latitude !== null && cafe.longitude !== null) {
        distance = calculateDistance(userLat, userLng, cafe.latitude, cafe.longitude)
        distanceText = formatDistance(distance)
      }

      return {
        id: cafe.id,
        name: cafe.name,
        slug: cafe.slug,
        description: cafe.description,
        image: cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
        address: cafe.address,
        city: cafe.city,
        latitude: cafe.latitude,
        longitude: cafe.longitude,
        phone: cafe.phone,
        // Mock data for features not yet implemented
        rating: 4.5 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 300) + 50,
        distance: distanceText,
        distanceKm: distance,
        prepTime: `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5) + 10} min`,
        isOpen: Math.random() > 0.2, // 80% chance of being open (will be replaced with real business hours)
        closesAt: "5:00 PM",
        priceRange: "$$",
        tags: ["Specialty", "Single Origin"].slice(0, Math.floor(Math.random() * 2) + 1),
        features: ["wifi", "card"].slice(0, Math.floor(Math.random() * 2) + 1),
        pointsPerDollar: cafe.pointsPerDollar,
        stats: {
          totalOrders: cafe._count.orders,
          menuItems: cafe._count.products,
        },
      }
    })

    // Filter by max distance if specified
    if (maxDistance !== null && userLat !== null && userLng !== null) {
      enrichedCafes = enrichedCafes.filter(cafe => 
        cafe.distanceKm !== null && cafe.distanceKm <= maxDistance
      )
    }

    // If we have no cafes (demo environment), return the demo cafe so UI still has data
    if (enrichedCafes.length === 0) {
      let distance: number | null = null
      let distanceText = "Demo cafe"

      if (userLat !== null && userLng !== null) {
        distance = calculateDistance(userLat, userLng, DEMO_CAFE.latitude, DEMO_CAFE.longitude)
        distanceText = formatDistance(distance)
      }

      enrichedCafes = [
        {
          ...DEMO_CAFE,
          distance,
          distanceKm: distance,
          distance: distanceText,
          rating: 4.7,
          reviewCount: 240,
          prepTime: "8-12 min",
          isOpen: true,
          closesAt: "6:00 PM",
          priceRange: "$$",
          tags: ["Specialty", "Single Origin"],
          features: ["wifi", "card"],
          stats: { totalOrders: 420, menuItems: 24 },
        },
      ]
    }

    // Sort by distance if user location is available, otherwise by popularity
    if (userLat !== null && userLng !== null) {
      enrichedCafes.sort((a, b) => {
        if (a.distanceKm === null) return 1
        if (b.distanceKm === null) return -1
        return a.distanceKm - b.distanceKm
      })
    }

    // Apply limit after filtering and sorting
    enrichedCafes = enrichedCafes.slice(0, limit)

    return NextResponse.json({
      cafes: enrichedCafes,
      total: enrichedCafes.length,
      userLocation: userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null,
    })
  } catch (error) {
    console.error("Cafes fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cafes" },
      { status: 500 }
    )
  }
}

