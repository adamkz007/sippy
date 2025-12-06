"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ChevronRight,
  Sparkles,
  Coffee,
  Gift,
  TrendingUp,
  Navigation,
  Heart
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data
const featuredCafes = [
  {
    id: "1",
    name: "The Daily Grind",
    slug: "daily-grind",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    rating: 4.8,
    reviews: 234,
    distance: "0.3 km",
    prepTime: "5-10 min",
    tags: ["Specialty", "Single Origin"],
    isOpen: true,
    isFavorite: true,
  },
  {
    id: "2",
    name: "Brew Lab",
    slug: "brew-lab",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    rating: 4.9,
    reviews: 456,
    distance: "0.5 km",
    prepTime: "8-12 min",
    tags: ["Pour Over", "Light Roast"],
    isOpen: true,
    isFavorite: false,
  },
  {
    id: "3",
    name: "Coffee Collective",
    slug: "coffee-collective",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
    rating: 4.7,
    reviews: 189,
    distance: "0.8 km",
    prepTime: "5-8 min",
    tags: ["Espresso", "Cozy"],
    isOpen: true,
    isFavorite: true,
  },
]

const quickReorders = [
  {
    id: "1",
    name: "Flat White",
    cafe: "The Daily Grind",
    cafeSlug: "daily-grind",
    price: 5.50,
    lastOrdered: "2 days ago",
    modifiers: "Oat milk, extra shot",
  },
  {
    id: "2", 
    name: "Cold Brew",
    cafe: "Brew Lab",
    cafeSlug: "brew-lab",
    price: 6.00,
    lastOrdered: "5 days ago",
    modifiers: "Large",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const points = 1250 // Mock user points

  return (
    <motion.div 
      className="min-h-screen"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header variants={item} className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-espresso-500 font-medium">Good morning ☕</p>
            <h1 className="text-xl font-bold text-espresso-900 font-display">Find your coffee</h1>
          </div>
          <Link href="/loyalty">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-espresso-800 to-espresso-900 text-cream-100 px-4 py-2 rounded-full shadow-lg shadow-espresso-900/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">{points.toLocaleString()}</span>
            </motion.div>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400" />
          <Input
            placeholder="Search cafes, drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/70 border-cream-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-espresso-200"
          />
        </div>
      </motion.header>

      <div className="px-4 space-y-6 py-4">
        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <Link href="/explore">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-espresso-700 to-espresso-900 rounded-2xl p-4 text-white shadow-lg shadow-espresso-900/30"
            >
              <Coffee className="w-6 h-6 mb-2" />
              <p className="text-xs font-medium opacity-80">Order</p>
              <p className="text-sm font-bold">Nearby</p>
            </motion.div>
          </Link>
          <Link href="/loyalty">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-cream-200 to-cream-300 rounded-2xl p-4 text-espresso-900 shadow-md"
            >
              <Gift className="w-6 h-6 mb-2" />
              <p className="text-xs font-medium opacity-70">Rewards</p>
              <p className="text-sm font-bold">3 Available</p>
            </motion.div>
          </Link>
          <Link href="/profile/coffee">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-latte-200 to-latte-300 rounded-2xl p-4 text-espresso-900 shadow-md"
            >
              <Sparkles className="w-6 h-6 mb-2" />
              <p className="text-xs font-medium opacity-70">Your</p>
              <p className="text-sm font-bold">Profile</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Reorder */}
        {quickReorders.length > 0 && (
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-espresso-900 font-display">Order Again</h2>
              <Link href="/profile/orders" className="text-sm text-espresso-600 font-medium flex items-center">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {quickReorders.map((order) => (
                <Link key={order.id} href={`/order/${order.cafeSlug}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-cream-200/50 min-w-[200px]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-espresso-100 to-latte-100 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-espresso-600" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {order.lastOrdered}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-espresso-900">{order.name}</h3>
                    <p className="text-xs text-espresso-500">{order.cafe}</p>
                    {order.modifiers && (
                      <p className="text-xs text-espresso-400 mt-1">{order.modifiers}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-espresso-900">{formatCurrency(order.price)}</span>
                      <Button size="sm" className="h-8 text-xs">Reorder</Button>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Nearby Cafes */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-espresso-600" />
              <h2 className="text-lg font-bold text-espresso-900 font-display">Nearby</h2>
            </div>
            <Link href="/explore" className="text-sm text-espresso-600 font-medium flex items-center">
              View map <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {featuredCafes.map((cafe, index) => (
              <Link key={cafe.id} href={`/order/${cafe.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className="overflow-hidden border-cream-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        {/* Cafe Image */}
                        <div className="relative w-28 h-28 shrink-0">
                          <div 
                            className="absolute inset-0 bg-cover bg-center rounded-l-lg"
                            style={{ backgroundImage: `url(${cafe.image})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 rounded-l-lg" />
                          {cafe.isFavorite && (
                            <div className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </div>
                          )}
                        </div>

                        {/* Cafe Info */}
                        <div className="flex-1 py-3 pr-3">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-espresso-900">{cafe.name}</h3>
                            <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-full">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-semibold text-espresso-800">{cafe.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-espresso-500 mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {cafe.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {cafe.prepTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={cafe.isOpen ? "default" : "secondary"}
                              className={cn(
                                "text-[10px] px-2",
                                cafe.isOpen 
                                  ? "bg-green-100 text-green-700 hover:bg-green-100" 
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {cafe.isOpen ? "Open" : "Closed"}
                            </Badge>
                            {cafe.tags.slice(0, 2).map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="text-[10px] border-cream-300 text-espresso-600"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Promotional Banner */}
        <motion.section variants={item}>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950 rounded-3xl p-6 text-white shadow-xl shadow-espresso-900/30"
          >
            <div className="relative z-10">
              <Badge className="bg-cream-200 text-espresso-900 mb-3">
                <Sparkles className="w-3 h-3 mr-1" />
                New Feature
              </Badge>
              <h3 className="text-xl font-bold mb-2 font-display">Discover Your Coffee Profile</h3>
              <p className="text-sm text-cream-200 mb-4">
                AI-powered taste analysis based on your order history. Find your perfect cup!
              </p>
              <Link href="/profile/coffee">
                <Button className="bg-cream-200 text-espresso-900 hover:bg-cream-100 h-10">
                  View My Profile
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cream-200/10 rounded-full blur-xl" />
            <div className="absolute right-12 top-4 w-16 h-16 bg-cream-200/5 rounded-full blur-lg" />
          </motion.div>
        </motion.section>

        {/* Trending Now */}
        <motion.section variants={item}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-espresso-600" />
            <h2 className="text-lg font-bold text-espresso-900 font-display">Trending Now</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Oat Latte", "Cold Brew", "Matcha", "Pour Over", "Cortado"].map((trend) => (
              <Badge 
                key={trend}
                variant="outline"
                className="px-4 py-2 text-sm border-cream-300 text-espresso-700 bg-white hover:bg-cream-100 cursor-pointer"
              >
                {trend}
              </Badge>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}

