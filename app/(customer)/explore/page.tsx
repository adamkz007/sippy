"use client"

import { useState } from "react"
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
  Leaf
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock cafe data
const allCafes = [
  {
    id: "1",
    name: "The Daily Grind",
    slug: "daily-grind",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    rating: 4.8,
    reviews: 234,
    address: "123 Coffee Street",
    distance: "0.3 km",
    prepTime: "5-10 min",
    tags: ["Specialty", "Single Origin", "WiFi"],
    isOpen: true,
    isFavorite: true,
    features: ["wifi", "card", "dog"],
    priceRange: "$$",
  },
  {
    id: "2",
    name: "Brew Lab",
    slug: "brew-lab",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    rating: 4.9,
    reviews: 456,
    address: "456 Roaster Lane",
    distance: "0.5 km",
    prepTime: "8-12 min",
    tags: ["Pour Over", "Light Roast"],
    isOpen: true,
    isFavorite: false,
    features: ["wifi", "card", "eco"],
    priceRange: "$$$",
  },
  {
    id: "3",
    name: "Coffee Collective",
    slug: "coffee-collective",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
    rating: 4.7,
    reviews: 189,
    address: "789 Barista Boulevard",
    distance: "0.8 km",
    prepTime: "5-8 min",
    tags: ["Espresso", "Cozy", "Breakfast"],
    isOpen: true,
    isFavorite: true,
    features: ["wifi", "card"],
    priceRange: "$$",
  },
  {
    id: "4",
    name: "Roast Republic",
    slug: "roast-republic",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    rating: 4.6,
    reviews: 312,
    address: "321 Bean Street",
    distance: "1.2 km",
    prepTime: "10-15 min",
    tags: ["Dark Roast", "Industrial"],
    isOpen: false,
    isFavorite: false,
    features: ["card", "dog"],
    priceRange: "$$",
  },
  {
    id: "5",
    name: "Filter House",
    slug: "filter-house",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
    rating: 4.8,
    reviews: 278,
    address: "555 Drip Drive",
    distance: "1.5 km",
    prepTime: "12-18 min",
    tags: ["Filter", "Third Wave"],
    isOpen: true,
    isFavorite: false,
    features: ["wifi", "card", "eco"],
    priceRange: "$$$",
  },
]

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

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const filteredCafes = allCafes.filter(cafe => {
    if (searchQuery && !cafe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (activeFilters.includes("open") && !cafe.isOpen) {
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

      {/* Results Count */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-espresso-600">
          <span className="font-semibold">{filteredCafes.length}</span> cafes found
        </p>
        <Button variant="ghost" size="sm" className="text-espresso-600 -mr-2">
          <Filter className="w-4 h-4 mr-1" />
          More Filters
        </Button>
      </div>

      {/* Cafe List */}
      {viewMode === "list" ? (
        <div className="px-4 space-y-3 pb-4">
          {filteredCafes.map((cafe, index) => (
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
                          style={{ backgroundImage: `url(${cafe.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                        <button 
                          className={cn(
                            "absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            cafe.isFavorite 
                              ? "bg-white text-red-500" 
                              : "bg-black/30 text-white hover:bg-black/50"
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            // Toggle favorite
                          }}
                        >
                          <Heart className={cn("w-4 h-4", cafe.isFavorite && "fill-current")} />
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
                            <p className="text-xs text-espresso-500">{cafe.address}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-espresso-800">{cafe.rating}</span>
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
          ))}
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

