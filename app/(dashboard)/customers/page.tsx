"use client"

import { useState } from "react"
import { 
  Search, 
  Users, 
  Gift, 
  TrendingUp,
  Star,
  Coffee,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatCurrency, formatPoints, getTierColor } from "@/lib/utils"

// Mock data
const mockCustomers = [
  { 
    id: "1", 
    name: "Alex Smith", 
    email: "alex@example.com",
    phone: "+61 400 111 222",
    tier: "GOLD",
    pointsBalance: 2450,
    lifetimeSpend: 1245.00,
    totalOrders: 87,
    lastOrder: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    coffeeProfile: { type: "Bold Explorer", roast: 4.2, strength: 4.5 }
  },
  { 
    id: "2", 
    name: "Maya Kim", 
    email: "maya@example.com",
    phone: "+61 400 222 333",
    tier: "PLATINUM",
    pointsBalance: 5820,
    lifetimeSpend: 3420.00,
    totalOrders: 156,
    lastOrder: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    coffeeProfile: { type: "Smooth Sipper", roast: 2.8, strength: 3.0 }
  },
  { 
    id: "3", 
    name: "Jordan Taylor", 
    email: "jordan@example.com",
    phone: "+61 400 333 444",
    tier: "SILVER",
    pointsBalance: 890,
    lifetimeSpend: 567.00,
    totalOrders: 42,
    lastOrder: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    coffeeProfile: { type: "Classic Lover", roast: 3.5, strength: 3.8 }
  },
  { 
    id: "4", 
    name: "Sam Lee", 
    email: "sam@example.com",
    phone: "+61 400 444 555",
    tier: "BRONZE",
    pointsBalance: 340,
    lifetimeSpend: 234.00,
    totalOrders: 18,
    lastOrder: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    coffeeProfile: null
  },
]

const tierStats = {
  BRONZE: mockCustomers.filter(c => c.tier === "BRONZE").length,
  SILVER: mockCustomers.filter(c => c.tier === "SILVER").length,
  GOLD: mockCustomers.filter(c => c.tier === "GOLD").length,
  PLATINUM: mockCustomers.filter(c => c.tier === "PLATINUM").length,
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesTier = !selectedTier || customer.tier === selectedTier
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    return matchesTier && matchesSearch
  })

  const totalCustomers = mockCustomers.length
  const totalPoints = mockCustomers.reduce((sum, c) => sum + c.pointsBalance, 0)
  const avgLifetimeValue = mockCustomers.reduce((sum, c) => sum + c.lifetimeSpend, 0) / totalCustomers

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
                <p className="text-2xl font-bold">{totalCustomers}</p>
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
                <p className="text-2xl font-bold">{formatPoints(totalPoints)}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(avgLifetimeValue)}</p>
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
                <p className="text-2xl font-bold">{tierStats.PLATINUM + tierStats.GOLD}</p>
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
          All ({totalCustomers})
        </Button>
        {(["PLATINUM", "GOLD", "SILVER", "BRONZE"] as const).map((tier) => (
          <Button
            key={tier}
            variant={selectedTier === tier ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTier(tier)}
          >
            <Badge variant={tier.toLowerCase() as any} className="mr-2">
              {tier}
            </Badge>
            ({tierStats[tier]})
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
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-espresso-100 text-espresso-700">
                    {customer.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{customer.name}</p>
                    <Badge variant={customer.tier.toLowerCase() as any}>
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
                  {customer.coffeeProfile && (
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

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

