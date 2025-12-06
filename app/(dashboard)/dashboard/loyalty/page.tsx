"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Gift, 
  TrendingUp, 
  Ticket,
  Star,
  Sparkles,
  Coffee,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatPoints } from "@/lib/utils"
import { useCurrency } from "@/components/currency-context"

interface LoyaltyStats {
  totalPointsIssued: number
  totalPointsRedeemed: number
  activeVouchers: number
  crossCafeRedemptions: number
}

interface Redemption {
  customer: string
  points: number
  description: string
  time: string
}

// Voucher catalog with values for dynamic formatting
const voucherCatalogData = [
  { id: "1", name: "Free Coffee", pointsCost: 500, value: 5.50, descKey: "free_coffee" },
  { id: "2", nameKey: "5_off", pointsCost: 400, value: 5, descKey: "5_off_desc" },
  { id: "3", nameKey: "10_off", pointsCost: 750, value: 10, descKey: "10_off_desc" },
  { id: "4", name: "15% Off", pointsCost: 600, value: 15, descKey: "percent_off" },
  { id: "5", name: "Free Upgrade", pointsCost: 200, value: 1, descKey: "upgrade" },
]

// Function to get voucher name with currency
const getVoucherName = (key: string, formatCurrency: (n: number) => string) => {
  switch(key) {
    case "5_off": return `${formatCurrency(5)} Off`
    case "10_off": return `${formatCurrency(10)} Off`
    case "free_coffee": return "Free Coffee"
    case "upgrade": return "Free Upgrade"
    default: return key
  }
}

// Function to get voucher description with currency
const getVoucherDesc = (key: string, formatCurrency: (n: number) => string) => {
  switch(key) {
    case "free_coffee": return `Any coffee up to ${formatCurrency(5.50)}`
    case "5_off_desc": return `${formatCurrency(5)} off any order`
    case "10_off_desc": return `${formatCurrency(10)} off any order`
    case "percent_off": return "15% off entire order"
    case "upgrade": return "Free size upgrade"
    default: return key
  }
}

export default function LoyaltyPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { formatCurrency } = useCurrency()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<LoyaltyStats>({
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    activeVouchers: 0,
    crossCafeRedemptions: 0,
  })
  const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([])

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const fetchLoyaltyData = useCallback(async () => {
    if (!cafeId) return
    
    try {
      const res = await fetch(`/api/dashboard/loyalty?cafeId=${cafeId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentRedemptions(data.recentRedemptions)
      }
    } catch (error) {
      console.error("Failed to fetch loyalty data:", error)
    }
    setLoading(false)
  }, [cafeId])

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (cafeId) {
      fetchLoyaltyData()
    } else {
      setLoading(false)
    }
  }, [cafeId, sessionStatus, fetchLoyaltyData])

  // Build dynamic voucher catalog with currency
  const voucherCatalog = voucherCatalogData.map(v => ({
    ...v,
    name: v.nameKey ? getVoucherName(v.nameKey, formatCurrency) : v.name,
    description: getVoucherDesc(v.descKey, formatCurrency),
  }))

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000)
    if (hours < 1) return "Just now"
    if (hours === 1) return "1 hour ago"
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

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
              You need to be associated with a cafe to view loyalty data.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso-950 font-display">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage your rewards and track engagement</p>
        </div>
        <Button>
          <Gift className="w-4 h-4 mr-2" />
          Create Promotion (soon!)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Points Issued</p>
                <p className="text-2xl font-bold text-amber-900">{formatPoints(stats.totalPointsIssued)}</p>
              </div>
              <Star className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Redeemed</p>
                <p className="text-2xl font-bold">{formatPoints(stats.totalPointsRedeemed)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Vouchers</p>
                <p className="text-2xl font-bold">{stats.activeVouchers}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-700">Cross-Cafe</p>
                <p className="text-2xl font-bold text-violet-900">{stats.crossCafeRedemptions}</p>
                <p className="text-xs text-violet-600">Network redemptions</p>
              </div>
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voucher Catalog */}
        <Card>
          <CardHeader>
            <CardTitle>Reward Catalog</CardTitle>
            <CardDescription>Vouchers customers can claim with points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voucherCatalog.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-espresso-600" />
                    </div>
                    <div>
                      <p className="font-medium">{voucher.name}</p>
                      <p className="text-sm text-muted-foreground">{voucher.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{formatPoints(voucher.pointsCost)} pts</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Redemptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Redemptions</CardTitle>
            <CardDescription>Latest voucher uses at your cafe</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRedemptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-8 h-8 mx-auto mb-2" />
                <p>No redemptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRedemptions.map((redemption, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {redemption.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {redemption.description} · {formatTimeAgo(redemption.time)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      -{formatPoints(redemption.points)} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
