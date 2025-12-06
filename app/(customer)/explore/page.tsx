"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  Map,
  List,
  Heart,
  Coffee,
  Wifi,
  CreditCard,
  Dog,
  Leaf,
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
  priceRange: string
}

const filters = [
  { id: "open", label: "Open Now", icon: Clock },
  { id: "nearby", label: "Near Me", icon: MapPin },
  { id: "specialty", label: "Specialty", icon: Coffee },
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "eco", label: "Eco-Friendly", icon: Leaf },
  { id: "dog", label: "Dog Friendly", icon: Dog },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>(["open"])
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [cafes, setCafes] = useState<CafeData[]>([])
  const [loading, setLoading] = useState(true)
  
  const { 
    latitude, 
    longitude, 
    loading: locationLoading, 
    error: locationError,
    requestLocation,
    permissionState,
    isSupported 
  } = useGeolocation()

  // Fetch cafes from API
  useEffect(() => {
    const fetchCafes = async () => {
      setLoading(true)
      try {
        // If we don't have location (either not granted or denied), fetch a larger list so users still see all cafes
        const limit = latitude && longitude ? "50" : "100"
        const params = new URLSearchParams({ limit })
        if (latitude && longitude) {
          params.append("lat", latitude.toString())
          params.append("lng", longitude.toString())
        }
        if (searchQuery) {
          params.append("q", searchQuery)
        }
        
        const res = await fetch(`/api/customer/cafes?${params}`)
        if (res.ok) {
          const data = await res.json()
          setCafes(data.cafes || [])
        }
      } catch (err) {
        console.error("Error fetching cafes:", err)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchCafes, 300)
    return () => clearTimeout(debounceTimer)
  }, [latitude, longitude, permissionState, searchQuery])

  const toggleFilter = (filterId: string) => {
    if (filterId === "nearby" && !latitude) {
      requestLocation()
      return
    }
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const filteredCafes = cafes.filter(cafe => {
    const isOpen = cafe.isOpen ?? true
    if (activeFilters.includes("open") && !isOpen) {
      return false
    }
    return true
  })

  const FeatureIcon = ({ feature }: { feature: string }) => {
    const icons: Record<string, typeof Wifi> = {
      wifi: Wifi,
      card: CreditCard,
      dog: Dog,
      eco: Leaf,
    }
    const Icon = icons[feature]
    if (!Icon) return null
    return <Icon className="w-3.5 h-3.5 text-espresso-500" />
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-espresso-900 font-display">Explore Cafes</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("map")}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400" />
          <Input
            placeholder="Search cafes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 bg-white/70 border-cream-200 rounded-xl focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id)
            return (
              <motion.button
                key={filter.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0",
                  isActive 
                    ? "bg-espresso-800 text-white" 
                    : "bg-white border border-cream-300 text-espresso-700 hover:bg-cream-100"
                )}
              >
                <filter.icon className="w-3.5 h-3.5" />
                {filter.label}
              </motion.button>
            )
          })}
        </div>
      </header>

      {/* Location Banner */}
      {isSupported && !latitude && permissionState !== "granted" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-espresso-50 to-cream-100 border border-cream-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-espresso-100 flex items-center justify-center shrink-0">
              <LocateFixed className="w-4 h-4 text-espresso-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-espresso-900">Enable location</p>
              <p className="text-xs text-espresso-600">Sort cafes by distance</p>
            </div>
            <Button 
              size="sm" 
              onClick={requestLocation}
              disabled={locationLoading}
              className="shrink-0"
            >
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
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

      {/* Results Count */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-espresso-600">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <>
              <span className="font-semibold">{filteredCafes.length}</span> cafes found
              {latitude && <span className="text-espresso-400"> • sorted by distance</span>}
            </>
          )}
        </p>
        <Button variant="ghost" size="sm" className="text-espresso-600 -mr-2">
          <Filter className="w-4 h-4 mr-1" />
          More Filters
        </Button>
      </div>

      {/* Cafe List */}
      {viewMode === "list" ? (
        <div className="px-4 space-y-3 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-espresso-400" />
            </div>
          ) : filteredCafes.length === 0 ? (
            <Card className="border-cream-200/50">
              <CardContent className="p-8 text-center">
                <Coffee className="w-12 h-12 text-espresso-300 mx-auto mb-4" />
                <h3 className="font-semibold text-espresso-700 mb-2">No cafes found</h3>
                <p className="text-sm text-espresso-500">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Check back later for new cafes in your area"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCafes.map((cafe, index) => (
              <Link key={cafe.id} href={`/order/${cafe.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card className={cn(
                    "overflow-hidden border-cream-200/50 shadow-sm",
                    !cafe.isOpen && "opacity-60"
                  )}>
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Cafe Image */}
                        <div className="relative w-32 h-32 shrink-0">
                          <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${cafe.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                          <button 
                            className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-black/30 text-white hover:bg-black/50"
                            onClick={(e) => {
                              e.preventDefault()
                              // Toggle favorite
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          {!cafe.isOpen && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Badge className="bg-white text-espresso-900">Closed</Badge>
                            </div>
                          )}
                        </div>

                        {/* Cafe Info */}
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="font-semibold text-espresso-900">{cafe.name}</h3>
                              <p className="text-xs text-espresso-500 truncate max-w-[180px]">{cafe.address}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-semibold text-espresso-800">{cafe.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-espresso-500 mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {cafe.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cafe.prepTime}
                            </span>
                            <span className="font-medium">{cafe.priceRange}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {cafe.features.map((feature) => (
                                <FeatureIcon key={feature} feature={feature} />
                              ))}
                            </div>
                            <div className="flex gap-1">
                              {cafe.tags.slice(0, 2).map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-[10px] border-cream-300 text-espresso-600 px-1.5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
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
      ) : (
        // Map View Placeholder
        <div className="flex-1 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Map className="w-16 h-16 text-espresso-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-espresso-700 mb-2">Map View</h3>
            <p className="text-sm text-espresso-500">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}

