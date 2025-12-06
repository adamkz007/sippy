"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  Sparkles,
  Coffee,
  Thermometer,
  Droplets,
  Sun,
  Moon,
  Zap,
  Share2,
  RefreshCw,
  MapPin,
  ChevronRight,
  Leaf
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock coffee profile data
const coffeeProfile = {
  profileType: "Bold Explorer",
  tagline: "Strong, adventurous, with a touch of sweetness",
  generatedAt: "December 2024",
  confidence: 0.87,
  ordersAnalyzed: 47,
  dimensions: {
    roastPreference: 4.2,    // 1-5 (light to dark)
    strength: 4.5,           // 1-5 (mild to strong)
    milkPreference: "oat",   // none, dairy, oat, almond, soy
    temperature: 3.8,        // 1-5 (iced to hot)
    sweetness: 2.1,          // 1-5 (none to sweet)
    adventureScore: 4.0,     // 1-5 (routine to explorer)
  },
  flavorNotes: ["Chocolate", "Caramel", "Nutty", "Bold"],
  topDrinks: [
    { name: "Flat White", count: 18 },
    { name: "Long Black", count: 12 },
    { name: "Oat Latte", count: 8 },
  ],
  recommendations: [
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
      cafe: "Filter House",
    },
  ],
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
  icon: any
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
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={cn("absolute top-0 h-2 rounded-full bg-gradient-to-r", color.replace("text-", "from-").replace("-600", "-400"), color.replace("text-", "to-").replace("-600", "-600"))}
        />
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-espresso-400 rounded-full shadow-sm"
        />
      </div>
      <div className="flex justify-between text-[10px] text-espresso-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export default function CoffeeProfilePage() {
  const [isSharing, setIsSharing] = useState(false)

  const getMilkEmoji = (milk: string) => {
    switch (milk) {
      case "oat": return "🌾"
      case "almond": return "🥜"
      case "soy": return "🫘"
      case "dairy": return "🥛"
      default: return "☕"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
                    {Math.round(coffeeProfile.confidence * 100)}% confidence
                  </span>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center text-4xl shadow-lg">
                    ☕
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1 font-display">
                    {coffeeProfile.profileType}
                  </h2>
                  <p className="text-sm text-cream-200 mb-4">
                    {coffeeProfile.tagline}
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
                Based on {coffeeProfile.ordersAnalyzed} orders · Updated {coffeeProfile.generatedAt}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taste Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Your Taste Profile</h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-4 space-y-6">
              <DimensionBar
                label="Roast Preference"
                value={coffeeProfile.dimensions.roastPreference}
                leftLabel="Light"
                rightLabel="Dark"
                icon={Sun}
                color="text-amber-600"
              />
              <DimensionBar
                label="Strength"
                value={coffeeProfile.dimensions.strength}
                leftLabel="Mild"
                rightLabel="Strong"
                icon={Zap}
                color="text-espresso-600"
              />
              <DimensionBar
                label="Temperature"
                value={coffeeProfile.dimensions.temperature}
                leftLabel="Iced"
                rightLabel="Hot"
                icon={Thermometer}
                color="text-red-500"
              />
              <DimensionBar
                label="Sweetness"
                value={coffeeProfile.dimensions.sweetness}
                leftLabel="None"
                rightLabel="Sweet"
                icon={Droplets}
                color="text-pink-500"
              />
              <DimensionBar
                label="Adventure"
                value={coffeeProfile.dimensions.adventureScore}
                leftLabel="Routine"
                rightLabel="Explorer"
                icon={Sparkles}
                color="text-violet-600"
              />
              
              {/* Milk Preference */}
              <div className="pt-2 border-t border-cream-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-espresso-800">Milk Preference</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {getMilkEmoji(coffeeProfile.dimensions.milkPreference)} {coffeeProfile.dimensions.milkPreference.charAt(0).toUpperCase() + coffeeProfile.dimensions.milkPreference.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Drinks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Your Top Drinks</h3>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {coffeeProfile.topDrinks.map((drink, index) => (
                <div 
                  key={drink.name}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    index !== coffeeProfile.topDrinks.length - 1 && "border-b border-cream-200/50"
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
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Recommended For You</h3>
          <div className="space-y-3">
            {coffeeProfile.recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="border-cream-200/50 shadow-sm hover:shadow-md transition-shadow">
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Refresh Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="outline" className="w-full h-12">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh My Profile
          </Button>
          <p className="text-xs text-center text-espresso-500 mt-2">
            Your profile updates automatically as you order
          </p>
        </motion.div>
      </div>
    </div>
  )
}

