"use client"

import { useEffect, useState } from "react"
import { 
  Store, 
  Search,
  MapPin,
  Users,
  ShoppingBag,
  DollarSign,
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Cafe {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  address: string | null
  city: string | null
  country: string
  phone: string | null
  email: string | null
  currency: string
  isActive: boolean
  createdAt: string
  _count: {
    orders: number
    staff: number
    products: number
  }
  totalRevenue: number
}

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    async function fetchCafes() {
      try {
        const res = await fetch(`/api/admin/cafes?search=${search}&filter=${filter}`)
        if (res.ok) {
          const data = await res.json()
          setCafes(data.cafes || [])
        }
      } catch (error) {
        console.error("Failed to fetch cafes:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCafes()
  }, [search, filter])

  const formatCurrency = (amount: number, currency: string = "MYR") => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const filteredCafes = cafes.filter((cafe) => {
    const matchesSearch = cafe.name.toLowerCase().includes(search.toLowerCase()) ||
      cafe.city?.toLowerCase().includes(search.toLowerCase()) ||
      cafe.email?.toLowerCase().includes(search.toLowerCase())
    
    if (filter === "all") return matchesSearch
    if (filter === "active") return matchesSearch && cafe.isActive
    if (filter === "inactive") return matchesSearch && !cafe.isActive
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cafes</h1>
          <p className="text-slate-400 mt-1">Manage all registered cafes on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            {cafes.filter(c => c.isActive).length} Active
          </Badge>
          <Badge variant="outline" className="border-slate-500/30 text-slate-400 bg-slate-500/10">
            {cafes.length} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search cafes by name, city, or email..."
            className="pl-10 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Cafes Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredCafes.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No cafes found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCafes.map((cafe) => (
            <Card key={cafe.id} className="bg-slate-900/50 border-slate-800/50 overflow-hidden group hover:border-slate-700/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {cafe.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{cafe.name}</CardTitle>
                      <CardDescription className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cafe.city || cafe.country}
                      </CardDescription>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    cafe.isActive 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {cafe.isActive ? (
                      <><CheckCircle2 className="w-3 h-3" /> Active</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> Inactive</>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <ShoppingBag className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{cafe._count.orders}</p>
                    <p className="text-xs text-slate-500">Orders</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <Users className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{cafe._count.staff}</p>
                    <p className="text-xs text-slate-500">Staff</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <Store className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{cafe._count.products}</p>
                    <p className="text-xs text-slate-500">Products</p>
                  </div>
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-400">Total Revenue</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {formatCurrency(cafe.totalRevenue, cafe.currency)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-2 border-t border-slate-800/50">
                  {cafe.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{cafe.email}</span>
                    </div>
                  )}
                  {cafe.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-4 h-4" />
                      <span>{cafe.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(cafe.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => window.open(`/order/${cafe.slug}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Store
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

