"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Search, 
  Users, 
  Gift, 
  TrendingUp,
  Star,
  Coffee,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatPoints, getTierColor } from "@/lib/utils"
import { useCurrency } from "@/components/currency-context"

interface CoffeeProfile {
  type: string | null
  roast: number | null
  strength: number | null
}

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  tier: string
  pointsBalance: number
  lifetimeSpend: number
  totalOrders: number
  lastOrder: string | null
  coffeeProfile: CoffeeProfile | null
}

interface Stats {
  totalCustomers: number
  totalPoints: number
  avgLifetimeValue: number
  vipCount: number
}

interface TierCounts {
  BRONZE: number
  SILVER: number
  GOLD: number
  PLATINUM: number
}

export default function CustomersPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { formatCurrency } = useCurrency()
  
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalPoints: 0,
    avgLifetimeValue: 0,
    vipCount: 0,
  })
  const [tierCounts, setTierCounts] = useState<TierCounts>({
    BRONZE: 0,
    SILVER: 0,
    GOLD: 0,
    PLATINUM: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const fetchCustomers = useCallback(async () => {
    if (!cafeId) return
    
    try {
      const params = new URLSearchParams({ cafeId })
      if (selectedTier) params.append('tier', selectedTier)
      if (searchQuery) params.append('search', searchQuery)
      
      const res = await fetch(`/api/dashboard/customers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers)
        setStats(data.stats)
        setTierCounts(data.tierCounts)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
    setLoading(false)
  }, [cafeId, selectedTier, searchQuery])

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (cafeId) {
      fetchCustomers()
    } else {
      setLoading(false)
    }
  }, [cafeId, sessionStatus, fetchCustomers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cafeId) fetchCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, cafeId, fetchCustomers])

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!cafeId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Coffee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Cafe Found</h2>
            <p className="text-muted-foreground">
              You need to be associated with a cafe to view customers.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-espresso-950 font-display">Customers</h1>
        <p className="text-muted-foreground">Manage your loyalty members</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPoints(stats.totalPoints)}</p>
                <p className="text-sm text-muted-foreground">Active Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgLifetimeValue)}</p>
                <p className="text-sm text-muted-foreground">Avg. Lifetime Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.vipCount}</p>
                <p className="text-sm text-muted-foreground">VIP Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedTier === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTier(null)}
        >
          All ({stats.totalCustomers})
        </Button>
        {(["PLATINUM", "GOLD", "SILVER", "BRONZE"] as const).map((tier) => (
          <Button
            key={tier}
            variant={selectedTier === tier ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
          >
            <Badge className={cn("mr-2", getTierColor(tier))}>
              {tier}
            </Badge>
            ({tierCounts[tier]})
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={customer.image || undefined} />
                  <AvatarFallback className="bg-espresso-100 text-espresso-700">
                    {customer.name?.split(" ").map(n => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{customer.name || "Unknown"}</p>
                    <Badge className={getTierColor(customer.tier)}>
                      {customer.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="font-bold">{formatPoints(customer.pointsBalance)}</p>
                    <p className="text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{customer.totalOrders}</p>
                    <p className="text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{formatCurrency(customer.lifetimeSpend)}</p>
                    <p className="text-muted-foreground">Lifetime</p>
                  </div>
                  {customer.coffeeProfile?.type && (
                    <div className="text-center">
                      <p className="font-bold">{customer.coffeeProfile.type}</p>
                      <p className="text-muted-foreground">Coffee Profile</p>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-muted-foreground">
              {stats.totalCustomers === 0 
                ? "Customers will appear here after they place orders" 
                : "Try adjusting your search or filters"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
