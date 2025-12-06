"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Clock,
  Coffee,
  Trash2,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock favorite cafes
const initialFavorites = [
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
    isOpen: true,
    lastVisited: "2 days ago",
    totalOrders: 12,
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
    isOpen: true,
    lastVisited: "1 week ago",
    totalOrders: 8,
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
    isOpen: false,
    lastVisited: "3 weeks ago",
    totalOrders: 3,
  },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites)

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id))
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-espresso-900 font-display">Favorite Cafes</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-espresso-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-espresso-700 mb-2">No favorites yet</h3>
            <p className="text-sm text-espresso-500 mb-4">
              Save your favorite cafes to quickly access them
            </p>
            <Link href="/explore">
              <Button>Explore Cafes</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {favorites.map((cafe, index) => (
                <motion.div
                  key={cafe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className={cn(
                    "overflow-hidden border-cream-200/50 shadow-sm",
                    !cafe.isOpen && "opacity-70"
                  )}>
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Cafe Image */}
                        <Link href={`/order/${cafe.slug}`} className="relative w-28 h-28 shrink-0">
                          <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${cafe.image})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                          {!cafe.isOpen && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Badge className="bg-white text-espresso-900 text-[10px]">Closed</Badge>
                            </div>
                          )}
                        </Link>

                        {/* Cafe Info */}
                        <div className="flex-1 p-3">
                          <Link href={`/order/${cafe.slug}`}>
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-espresso-900">{cafe.name}</h3>
                              <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-full">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold text-espresso-800">{cafe.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-espresso-500 mb-1">{cafe.address}</p>
                            
                            <div className="flex items-center gap-3 text-xs text-espresso-500 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {cafe.distance}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {cafe.prepTime}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-espresso-500">
                              <Coffee className="w-3 h-3" />
                              <span>{cafe.totalOrders} orders · Last visited {cafe.lastVisited}</span>
                            </div>
                          </Link>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFavorite(cafe.id)}
                          className="px-3 flex items-center justify-center border-l border-cream-200/50 text-espresso-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/explore">
              <Button variant="outline">
                Discover More Cafes
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

