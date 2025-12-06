"use client"

import { 
  Gift, 
  TrendingUp, 
  Users,
  Ticket,
  Star,
  ArrowRight,
  Sparkles,
  Coffee
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency, formatPoints } from "@/lib/utils"

// Mock data
const stats = {
  totalPointsIssued: 125000,
  totalPointsRedeemed: 45000,
  activeVouchers: 234,
  crossCafeRedemptions: 12,
}

const voucherCatalog = [
  { id: "1", name: "Free Coffee", pointsCost: 500, value: 5.50, description: "Any coffee up to $5.50", claimedCount: 89 },
  { id: "2", name: "$5 Off", pointsCost: 400, value: 5, description: "$5 off any order", claimedCount: 156 },
  { id: "3", name: "$10 Off", pointsCost: 750, value: 10, description: "$10 off any order", claimedCount: 45 },
  { id: "4", name: "15% Off", pointsCost: 600, value: 15, description: "15% off entire order", claimedCount: 67 },
  { id: "5", name: "Free Upgrade", pointsCost: 200, value: 1, description: "Free size upgrade", claimedCount: 234 },
]

const recentRedemptions = [
  { customer: "Alex S.", voucher: "Free Coffee", cafe: "Your Cafe", pointsUsed: 500, time: "2 hours ago" },
  { customer: "Maya K.", voucher: "$10 Off", cafe: "Bean & Gone", pointsUsed: 750, time: "Yesterday", crossCafe: true },
  { customer: "Jordan T.", voucher: "Free Upgrade", cafe: "Your Cafe", pointsUsed: 200, time: "Yesterday" },
  { customer: "Sam L.", voucher: "$5 Off", cafe: "Your Cafe", pointsUsed: 400, time: "2 days ago" },
]

const tierBenefits = [
  { tier: "BRONZE", minPoints: 0, benefits: ["1 point per $1", "Birthday reward"] },
  { tier: "SILVER", minPoints: 1000, benefits: ["1.25 points per $1", "Free upgrade/month", "Early access"] },
  { tier: "GOLD", minPoints: 5000, benefits: ["1.5 points per $1", "Free coffee/month", "Priority queue"] },
  { tier: "PLATINUM", minPoints: 15000, benefits: ["2 points per $1", "Free coffee/week", "VIP events"] },
]

export default function LoyaltyPage() {
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
          Create Promotion
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
                    <p className="text-xs text-muted-foreground mt-1">{voucher.claimedCount} claimed</p>
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
            <div className="space-y-4">
              {recentRedemptions.map((redemption, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {redemption.customer} used {redemption.voucher}
                        {redemption.crossCafe && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Network
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.cafe} · {redemption.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-red-600">
                    -{formatPoints(redemption.pointsUsed)} pts
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tier Benefits</CardTitle>
            <CardDescription>Rewards for your most loyal customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {tierBenefits.map((tier) => (
                <div 
                  key={tier.tier}
                  className={`p-4 rounded-xl border-2 ${
                    tier.tier === "PLATINUM" ? "border-violet-300 bg-violet-50" :
                    tier.tier === "GOLD" ? "border-amber-300 bg-amber-50" :
                    tier.tier === "SILVER" ? "border-slate-300 bg-slate-50" :
                    "border-orange-300 bg-orange-50"
                  }`}
                >
                  <Badge 
                    variant={tier.tier.toLowerCase() as any}
                    className="mb-3"
                  >
                    {tier.tier}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tier.minPoints === 0 ? "Starting tier" : `${formatPoints(tier.minPoints)}+ pts`}
                  </p>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

