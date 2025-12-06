import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Coffee profile types based on taste patterns
const profileTypes = [
  { type: "Bold Explorer", description: "Loves dark roasts and strong flavors" },
  { type: "Smooth Sipper", description: "Prefers balanced, mellow drinks" },
  { type: "Classic Lover", description: "Sticks to traditional favorites" },
  { type: "Adventurous Taster", description: "Always trying new things" },
  { type: "Health Conscious", description: "Favors plant-based and wellness options" },
  { type: "Sweet Tooth", description: "Enjoys flavored and sweetened drinks" },
  { type: "Minimalist", description: "Appreciates simplicity and quality" },
  { type: "Cold Brew Enthusiast", description: "Loves iced and cold beverages" },
]

const flavorNotes = [
  "chocolate", "nutty", "fruity", "caramel", "floral",
  "citrus", "berry", "earthy", "spicy", "vanilla"
]

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 })
    }

    // Get customer's order history
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          where: {
            status: "COMPLETED",
          },
          orderBy: { createdAt: "desc" },
          take: 100, // Last 100 orders for analysis
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    if (customer.orders.length < 5) {
      return NextResponse.json(
        { error: "Need at least 5 orders to generate profile" },
        { status: 400 }
      )
    }

    // Analyze order patterns
    const analysis = analyzeOrders(customer.orders)
    
    // Generate profile based on analysis
    const profile = generateProfile(analysis)

    // Save or update coffee profile
    const coffeeProfile = await prisma.coffeeProfile.upsert({
      where: { customerId },
      update: {
        profileType: profile.profileType,
        roastPreference: profile.roastPreference,
        strength: profile.strength,
        milkPreference: profile.milkPreference,
        temperature: profile.temperature,
        sweetness: profile.sweetness,
        adventureScore: profile.adventureScore,
        flavorNotes: profile.flavorNotes,
        confidence: profile.confidence,
        generatedAt: new Date(),
      },
      create: {
        customerId,
        profileType: profile.profileType,
        roastPreference: profile.roastPreference,
        strength: profile.strength,
        milkPreference: profile.milkPreference,
        temperature: profile.temperature,
        sweetness: profile.sweetness,
        adventureScore: profile.adventureScore,
        flavorNotes: profile.flavorNotes,
        confidence: profile.confidence,
      },
    })

    return NextResponse.json({
      profile: coffeeProfile,
      analysis: {
        ordersAnalyzed: customer.orders.length,
        topProducts: analysis.topProducts.slice(0, 5),
      },
    })
  } catch (error) {
    console.error("Profile generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate profile" },
      { status: 500 }
    )
  }
}

interface OrderAnalysis {
  totalOrders: number
  topProducts: { name: string; count: number }[]
  roastLevels: Record<string, number>
  milkTypes: Record<string, number>
  temperatures: { hot: number; iced: number }
  hasModifiers: { sweeteners: number; extraShots: number }
  productVariety: number
  categoryBreakdown: Record<string, number>
}

function analyzeOrders(orders: any[]): OrderAnalysis {
  const productCounts: Record<string, number> = {}
  const roastLevels: Record<string, number> = {}
  const milkTypes: Record<string, number> = {}
  const temperatures = { hot: 0, iced: 0 }
  const hasModifiers = { sweeteners: 0, extraShots: 0 }
  const categoryBreakdown: Record<string, number> = {}
  const uniqueProducts = new Set<string>()

  for (const order of orders) {
    for (const item of order.items) {
      const productName = item.product?.name || item.name
      productCounts[productName] = (productCounts[productName] || 0) + item.quantity
      uniqueProducts.add(productName)

      // Track roast level
      if (item.product?.roastLevel) {
        roastLevels[item.product.roastLevel] = (roastLevels[item.product.roastLevel] || 0) + item.quantity
      }

      // Track category
      const category = item.product?.category?.name || "Other"
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + item.quantity

      // Check for iced drinks
      if (productName.toLowerCase().includes("iced") || productName.toLowerCase().includes("cold")) {
        temperatures.iced += item.quantity
      } else {
        temperatures.hot += item.quantity
      }

      // Check modifiers for milk and sweeteners
      if (item.modifiers) {
        const mods = typeof item.modifiers === "string" ? JSON.parse(item.modifiers) : item.modifiers
        for (const mod of Object.values(mods) as string[]) {
          if (mod.toLowerCase().includes("oat") || mod.toLowerCase().includes("almond") || 
              mod.toLowerCase().includes("soy") || mod.toLowerCase().includes("coconut")) {
            milkTypes["plant-based"] = (milkTypes["plant-based"] || 0) + 1
          }
          if (mod.toLowerCase().includes("syrup") || mod.toLowerCase().includes("sugar")) {
            hasModifiers.sweeteners++
          }
          if (mod.toLowerCase().includes("extra shot")) {
            hasModifiers.extraShots++
          }
        }
      }

      // Infer milk preference from product name
      if (productName.toLowerCase().includes("oat")) {
        milkTypes["oat"] = (milkTypes["oat"] || 0) + item.quantity
      } else if (productName.toLowerCase().includes("black") || productName.toLowerCase() === "espresso") {
        milkTypes["none"] = (milkTypes["none"] || 0) + item.quantity
      } else {
        milkTypes["dairy"] = (milkTypes["dairy"] || 0) + item.quantity
      }
    }
  }

  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))

  return {
    totalOrders: orders.length,
    topProducts,
    roastLevels,
    milkTypes,
    temperatures,
    hasModifiers,
    productVariety: uniqueProducts.size,
    categoryBreakdown,
  }
}

function generateProfile(analysis: OrderAnalysis) {
  // Calculate roast preference (1-5 scale, 1=light, 5=dark)
  const roastScore = calculateRoastScore(analysis.roastLevels)
  
  // Calculate strength preference based on espresso vs milk drinks
  const strengthScore = analysis.milkTypes["none"] ? 
    Math.min(5, 3 + (analysis.milkTypes["none"] / analysis.totalOrders) * 2) : 3

  // Determine milk preference
  const milkPref = Object.entries(analysis.milkTypes)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "dairy"

  // Temperature preference (1=iced, 5=hot)
  const totalTemp = analysis.temperatures.hot + analysis.temperatures.iced
  const tempScore = totalTemp > 0 ? 
    1 + (analysis.temperatures.hot / totalTemp) * 4 : 3.5

  // Sweetness based on modifier usage
  const totalItems = analysis.topProducts.reduce((sum, p) => sum + p.count, 0)
  const sweetnessScore = Math.min(5, 1 + (analysis.hasModifiers.sweeteners / totalItems) * 8)

  // Adventure score based on product variety
  const varietyRatio = analysis.productVariety / Math.max(1, analysis.totalOrders)
  const adventureScore = Math.min(5, 1 + varietyRatio * 8)

  // Determine profile type
  const profileType = determineProfileType({
    roast: roastScore,
    strength: strengthScore,
    milk: milkPref,
    temperature: tempScore,
    sweetness: sweetnessScore,
    adventure: adventureScore,
    categories: analysis.categoryBreakdown,
  })

  // Select flavor notes based on preferences
  const selectedFlavors = selectFlavorNotes(roastScore, sweetnessScore)

  // Confidence based on data quality
  const confidence = Math.min(0.95, 0.5 + (analysis.totalOrders / 100) * 0.3 + (analysis.productVariety / 20) * 0.15)

  return {
    profileType,
    roastPreference: Math.round(roastScore * 10) / 10,
    strength: Math.round(strengthScore * 10) / 10,
    milkPreference: milkPref,
    temperature: Math.round(tempScore * 10) / 10,
    sweetness: Math.round(sweetnessScore * 10) / 10,
    adventureScore: Math.round(adventureScore * 10) / 10,
    flavorNotes: selectedFlavors,
    confidence: Math.round(confidence * 100) / 100,
  }
}

function calculateRoastScore(roastLevels: Record<string, number>): number {
  const weights: Record<string, number> = {
    LIGHT: 1,
    MEDIUM_LIGHT: 2,
    MEDIUM: 3,
    MEDIUM_DARK: 4,
    DARK: 5,
  }
  
  let totalWeight = 0
  let totalCount = 0
  
  for (const [level, count] of Object.entries(roastLevels)) {
    if (weights[level]) {
      totalWeight += weights[level] * count
      totalCount += count
    }
  }
  
  return totalCount > 0 ? totalWeight / totalCount : 3 // Default to medium
}

function determineProfileType(prefs: {
  roast: number
  strength: number
  milk: string
  temperature: number
  sweetness: number
  adventure: number
  categories: Record<string, number>
}): string {
  // Bold Explorer: Dark roast + strong
  if (prefs.roast >= 4 && prefs.strength >= 4) {
    return "Bold Explorer"
  }
  
  // Cold Brew Enthusiast: Prefers cold drinks
  if (prefs.temperature <= 2.5) {
    return "Cold Brew Enthusiast"
  }
  
  // Health Conscious: Plant-based milk
  if (prefs.milk === "plant-based" || prefs.milk === "oat") {
    return "Health Conscious"
  }
  
  // Sweet Tooth: High sweetness
  if (prefs.sweetness >= 3.5) {
    return "Sweet Tooth"
  }
  
  // Adventurous Taster: High variety
  if (prefs.adventure >= 4) {
    return "Adventurous Taster"
  }
  
  // Minimalist: No milk, medium-light roast
  if (prefs.milk === "none" && prefs.roast <= 3) {
    return "Minimalist"
  }
  
  // Smooth Sipper: Balanced preferences
  if (prefs.roast >= 2 && prefs.roast <= 3.5 && prefs.strength <= 3.5) {
    return "Smooth Sipper"
  }
  
  // Default
  return "Classic Lover"
}

function selectFlavorNotes(roastScore: number, sweetnessScore: number): string[] {
  const notes: string[] = []
  
  // Dark roasts → chocolate, nutty, earthy
  if (roastScore >= 4) {
    notes.push("chocolate", "nutty")
    if (roastScore >= 4.5) notes.push("earthy")
  }
  // Medium roasts → caramel, vanilla
  else if (roastScore >= 2.5) {
    notes.push("caramel")
    if (sweetnessScore >= 3) notes.push("vanilla")
  }
  // Light roasts → fruity, floral, citrus
  else {
    notes.push("fruity", "floral")
    if (roastScore <= 1.5) notes.push("citrus")
  }
  
  // High sweetness → add berry
  if (sweetnessScore >= 4) {
    notes.push("berry")
  }
  
  return notes.slice(0, 4) // Max 4 notes
}

