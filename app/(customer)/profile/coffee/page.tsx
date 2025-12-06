"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  ArrowLeft,
  Sparkles,
  Coffee,
  Thermometer,
  Droplets,
  Sun,
  Zap,
  Share2,
  RefreshCw,
  MapPin,
  ChevronRight,
  Leaf,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CoffeeProfile {
  id: string
  profileType: string | null
  roastPreference: number | null
  strength: number | null
  milkPreference: string | null
  temperature: number | null
  sweetness: number | null
  adventureScore: number | null
  flavorNotes: string[]
  confidence: number | null
  generatedAt: string
}

interface CustomerData {
  coffeeProfile: CoffeeProfile | null
  stats: {
    totalOrders: number
  }
}

const DimensionBar = ({ 
  label, 
  value, 
  leftLabel, 
  rightLabel, 
  icon: Icon,
  color 
}: {
  label: string
  value: number
  leftLabel: string
  rightLabel: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) => {
  const percent = ((value - 1) / 4) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", color)} />
          <span className="text-sm font-medium text-espresso-800">{label}</span>
        </div>
        <span className="text-xs font-semibold text-espresso-600">{value.toFixed(1)}</span>
      </div>
      <div className="relative">
        <div className="h-2 bg-cream-200 rounded-full" />
        <div 
          className={cn(
            "absolute top-0 h-2 rounded-full bg-gradient-to-r transition-all duration-500",
            color.replace("text-", "from-").replace("-600", "-400"),
            color.replace("text-", "to-").replace("-600", "-600")
          )}
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-espresso-400 rounded-full shadow-sm transition-all duration-500"
          style={{ left: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-espresso-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

// Default profile type descriptions
const profileDescriptions: Record<string, string> = {
  "Bold Explorer": "Strong, adventurous, with a touch of sweetness",
  "Classic Purist": "Traditional, no-fuss, appreciates the basics",
  "Milk Master": "Smooth, creamy, loves a good latte",
  "Sweet Tooth": "Loves flavored drinks with extra sweetness",
  "Cold Brew Enthusiast": "Prefers iced, smooth, low acidity",
}

export default function CoffeeProfilePage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [isSharing, setIsSharing] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)

  const handleBack = useCallback(() => {
    router.push('/home')
  }, [router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (sessionStatus === "loading") return
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/customer/me")
        if (res.ok) {
          const data = await res.json()
          setCustomerData(data)
        }
      } catch (err) {
        console.error("Error fetching coffee profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, sessionStatus])

  const getMilkEmoji = (milk: string | null) => {
    switch (milk) {
      case "oat": return "🌾"
      case "almond": return "🥜"
      case "soy": return "🫘"
      case "dairy": return "🥛"
      default: return "☕"
    }
  }

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-espresso-900">Sign in to view your coffee profile</h2>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  const coffeeProfile = customerData?.coffeeProfile
  const ordersAnalyzed = customerData?.stats?.totalOrders || 0

  // If no coffee profile exists yet
  if (!coffeeProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 animate-in fade-in duration-200">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-sm" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-espresso-900 font-display">My Coffee Profile</h1>
            </div>
          </div>
        </header>

        <div className="px-4 py-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-espresso-100 to-espresso-200 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-espresso-400" />
          </div>
          <h2 className="text-2xl font-bold text-espresso-900 mb-3 font-display">Discover Your Taste</h2>
          <p className="text-espresso-600 mb-8 max-w-sm mx-auto">
            Order a few more coffees and we'll create your personalized taste profile powered by AI.
          </p>
          <div className="bg-cream-200/50 rounded-2xl p-4 max-w-sm mx-auto mb-6">
            <p className="text-sm text-espresso-700">
              <span className="font-semibold">{ordersAnalyzed} orders</span> so far.
              We need at least <span className="font-semibold">5 orders</span> to generate your profile.
            </p>
          </div>
          <Link href="/explore">
            <Button>Find a Cafe</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tagline = profileDescriptions[coffeeProfile.profileType || ""] || "Your unique coffee journey"
  const generatedDate = new Date(coffeeProfile.generatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Mock top drinks and recommendations (would come from API in real implementation)
  const topDrinks = [
    { name: "Flat White", count: 18 },
    { name: "Long Black", count: 12 },
    { name: "Oat Latte", count: 8 },
  ]

  const recommendations = [
    {
      id: "1",
      name: "Ethiopian Yirgacheffe",
      description: "Fruity notes to expand your palate",
      match: 94,
      cafe: "Brew Lab",
    },
    {
      id: "2", 
      name: "Guatemala Antigua",
      description: "Chocolate & spice, medium body",
      match: 91,
      cafe: "The Daily Grind",
    },
    {
      id: "3",
      name: "Cold Brew Tonic",
      description: "Refreshing twist on your favorites",
      match: 88,
      cafe: "Coffee Collective",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 animate-in fade-in duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-espresso-900 font-display">My Coffee Profile</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => setIsSharing(true)}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Hero */}
        <Card className="overflow-hidden border-cream-200/50 shadow-lg">
          <div className="relative bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cream-200/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-espresso-600/30 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-cream-200/20 text-cream-100 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
                <span className="text-xs text-cream-300">
                  {coffeeProfile.confidence ? `${Math.round(coffeeProfile.confidence * 100)}% confidence` : ''}
                </span>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center text-4xl shadow-lg">
                  ☕
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 font-display">
                  {coffeeProfile.profileType || "Coffee Lover"}
                </h2>
                <p className="text-sm text-cream-200 mb-4">
                  {tagline}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {coffeeProfile.flavorNotes.map((note) => (
                    <Badge 
                      key={note}
                      className="bg-white/10 text-cream-100 backdrop-blur-sm"
                    >
                      {note}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <p className="text-xs text-center text-espresso-500">
              Based on {ordersAnalyzed} orders · Updated {generatedDate}
            </p>
          </CardContent>
        </Card>

        {/* Taste Dimensions */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Your Taste Profile</h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-4 space-y-6">
              {coffeeProfile.roastPreference && (
                <DimensionBar
                  label="Roast Preference"
                  value={coffeeProfile.roastPreference}
                  leftLabel="Light"
                  rightLabel="Dark"
                  icon={Sun}
                  color="text-amber-600"
                />
              )}
              {coffeeProfile.strength && (
                <DimensionBar
                  label="Strength"
                  value={coffeeProfile.strength}
                  leftLabel="Mild"
                  rightLabel="Strong"
                  icon={Zap}
                  color="text-espresso-600"
                />
              )}
              {coffeeProfile.temperature && (
                <DimensionBar
                  label="Temperature"
                  value={coffeeProfile.temperature}
                  leftLabel="Iced"
                  rightLabel="Hot"
                  icon={Thermometer}
                  color="text-red-500"
                />
              )}
              {coffeeProfile.sweetness && (
                <DimensionBar
                  label="Sweetness"
                  value={coffeeProfile.sweetness}
                  leftLabel="None"
                  rightLabel="Sweet"
                  icon={Droplets}
                  color="text-pink-500"
                />
              )}
              {coffeeProfile.adventureScore && (
                <DimensionBar
                  label="Adventure"
                  value={coffeeProfile.adventureScore}
                  leftLabel="Routine"
                  rightLabel="Explorer"
                  icon={Sparkles}
                  color="text-violet-600"
                />
              )}
              
              {/* Milk Preference */}
              {coffeeProfile.milkPreference && (
                <div className="pt-2 border-t border-cream-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-espresso-800">Milk Preference</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {getMilkEmoji(coffeeProfile.milkPreference)} {coffeeProfile.milkPreference.charAt(0).toUpperCase() + coffeeProfile.milkPreference.slice(1)}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Drinks */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Your Top Drinks</h3>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {topDrinks.map((drink, index) => (
                <div 
                  key={drink.name}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    index !== topDrinks.length - 1 && "border-b border-cream-200/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-espresso-100 to-espresso-200 flex items-center justify-center font-bold text-espresso-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-espresso-900">{drink.name}</p>
                  </div>
                  <Badge variant="outline" className="border-cream-300 text-espresso-600">
                    {drink.count} orders
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Recommended For You</h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-cream-200/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream-100 to-latte-100 flex items-center justify-center">
                      <Coffee className="w-6 h-6 text-espresso-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-espresso-900">{rec.name}</h4>
                        <Badge className="bg-green-100 text-green-700 text-[10px]">
                          {rec.match}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-espresso-600 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-1 text-xs text-espresso-500">
                        <MapPin className="w-3 h-3" />
                        {rec.cafe}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-espresso-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Refresh Profile */}
        <div>
          <Button variant="outline" className="w-full h-12">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh My Profile
          </Button>
          <p className="text-xs text-center text-espresso-500 mt-2">
            Your profile updates automatically as you order
          </p>
        </div>
      </div>
    </div>
  )
}
