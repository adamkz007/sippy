"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
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
  Heart,
  Loader2,
  LocateFixed,
  AlertCircle
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGeolocation } from "@/lib/hooks/use-geolocation"

interface CustomerProfile {
  id: string
  user: {
    name: string | null
    email: string
  }
  loyalty: {
    tier: string
    pointsBalance: number
  }
  vouchers: any[]
  stats: {
    totalOrders: number
    favoriteCafes: number
  }
}

interface CafeData {
  id: string
  name: string
  slug: string
  image: string | null
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  rating: number
  reviewCount: number
  distance: string
  distanceKm: number | null
  prepTime: string
  isOpen: boolean
  tags: string[]
  features: string[]
}

const quickReorders = [
  {
    id: "1",
    name: "Flat White",
    cafe: "The Daily Grind",
    cafeSlug: "daily-grind",
    price: 14.00,
    lastOrdered: "2 days ago",
    modifiers: "Oat milk, extra shot",
  },
  {
    id: "2", 
    name: "Cold Brew",
    cafe: "Brew Lab",
    cafeSlug: "brew-lab",
    price: 14.00,
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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning ☕"
  if (hour < 17) return "Good afternoon ☕"
  return "Good evening ☕"
}

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cafes, setCafes] = useState<CafeData[]>([])
  const [cafesLoading, setCafesLoading] = useState(true)
  
  const { 
    latitude, 
    longitude, 
    loading: locationLoading, 
    error: locationError,
    requestLocation,
    permissionState,
    isSupported 
  } = useGeolocation()

  // Fetch profile
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
          setProfile(data)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, sessionStatus])

  // Fetch nearby cafes
  useEffect(() => {
    const fetchCafes = async () => {
      setCafesLoading(true)
      try {
        // If we don't have location (either not granted or denied), fetch a larger list so users still see all cafes
        const limit = latitude && longitude ? "5" : "50"
        const params = new URLSearchParams({ limit })
        if (latitude && longitude) {
          params.append("lat", latitude.toString())
          params.append("lng", longitude.toString())
        }
        
        const res = await fetch(`/api/customer/cafes?${params}`)
        if (res.ok) {
          const data = await res.json()
          setCafes(data.cafes || [])
        }
      } catch (err) {
        console.error("Error fetching cafes:", err)
      } finally {
        setCafesLoading(false)
      }
    }

    fetchCafes()
  }, [latitude, longitude, permissionState])

  const points = profile?.loyalty?.pointsBalance || 0
  const voucherCount = profile?.vouchers?.length || 0
  const userName = profile?.user?.name || session?.user?.name || "Guest"

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
            <p className="text-sm text-espresso-500 font-medium">{getGreeting()}</p>
            <h1 className="text-xl font-bold text-espresso-900 font-display">
              {session ? `Hi, ${userName.split(' ')[0]}` : "Find your coffee"}
            </h1>
          </div>
          {session ? (
            <Link href="/loyalty">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-espresso-800 to-espresso-900 text-cream-100 px-4 py-2 rounded-full shadow-lg shadow-espresso-900/20"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    points.toLocaleString()
                  )}
                </span>
              </motion.div>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
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
              <p className="text-sm font-bold">{voucherCount} Available</p>
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
        {session && quickReorders.length > 0 && (
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
              {locationLoading && <Loader2 className="w-3 h-3 animate-spin text-espresso-400" />}
            </div>
            <Link href="/explore" className="text-sm text-espresso-600 font-medium flex items-center">
              View map <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {/* Location Permission Banner */}
          {isSupported && permissionState !== "granted" && !latitude && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-3 p-3 rounded-xl bg-gradient-to-r from-espresso-50 to-cream-100 border border-cream-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-espresso-100 flex items-center justify-center shrink-0">
                  <LocateFixed className="w-5 h-5 text-espresso-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-espresso-900">Enable location</p>
                  <p className="text-xs text-espresso-600">See cafes sorted by distance from you</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="shrink-0"
                >
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Allow"}
                </Button>
              </div>
              {locationError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {locationError}
                </p>
              )}
            </motion.div>
          )}

          {/* Cafes List */}
          <div className="space-y-4">
            {cafesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-espresso-400" />
              </div>
            ) : cafes.length === 0 ? (
              <Card className="border-cream-200/50">
                <CardContent className="p-6 text-center">
                  <Coffee className="w-10 h-10 text-espresso-300 mx-auto mb-3" />
                  <p className="text-sm text-espresso-600">No cafes found nearby</p>
                  <p className="text-xs text-espresso-400 mt-1">Check back later or expand your search</p>
                </CardContent>
              </Card>
            ) : (
              cafes.map((cafe, index) => (
                <Link key={cafe.id} href={`/order/${cafe.slug}`} className="block">
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
                              style={{ backgroundImage: `url(${cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 rounded-l-lg" />
                          </div>

                          {/* Cafe Info */}
                          <div className="flex-1 py-3 pr-3">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-espresso-900">{cafe.name}</h3>
                              <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold text-espresso-800">{cafe.rating.toFixed(1)}</span>
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
              ))
            )}
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
