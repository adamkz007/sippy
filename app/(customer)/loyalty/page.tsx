"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  Gift, 
  Sparkles, 
  ChevronRight,
  Clock,
  Check,
  TrendingUp,
  Trophy,
  Zap,
  Loader2
} from "lucide-react"
import QRCode from "react-qr-code"
import { cn, formatCurrency, formatPoints, getTierColor, getCurrencyInfo } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CustomerProfile {
  id: string
  user?: {
    id: string
    name?: string | null
    email?: string | null
    phone?: string | null
    image?: string | null
  }
  loyalty: {
    tier: string
    pointsBalance: number
    lifetimePoints: number
    lifetimeSpend: number
  }
  vouchers: Voucher[]
}

interface Voucher {
  id: string
  code: string
  type: string
  expiresAt: string
}

interface PointTransaction {
  id: string
  type: string
  points: number
  description: string
  createdAt: string
  cafeId: string
}

// Rewards data factory function
const getAvailableRewards = (formatCurrency: (n: number) => string) => [
  {
    id: "1",
    name: "Free Flat White",
    description: "Any regular size milk coffee",
    pointsCost: 500,
    image: "☕",
    expiresIn: "30 days",
    type: "FREE_DRINK",
  },
  {
    id: "2",
    name: `${formatCurrency(5)} Off`,
    description: `On orders over ${formatCurrency(15)}`,
    pointsCost: 450,
    image: "💰",
    expiresIn: "14 days",
    type: "FIXED_AMOUNT",
  },
  {
    id: "3",
    name: "Free Size Upgrade",
    description: "Upgrade any drink to large",
    pointsCost: 200,
    image: "⬆️",
    expiresIn: "7 days",
    type: "FREE_UPGRADE",
  },
  {
    id: "4",
    name: "Free Pastry",
    description: "Any pastry or baked good",
    pointsCost: 600,
    image: "🥐",
    expiresIn: "14 days",
    type: "FREE_DRINK",
  },
]

// Tier benefits factory function
const getTierBenefits = (currencySymbol: string) => ({
  BRONZE: [`1 point per ${currencySymbol}1 spent`, "Birthday reward", "Early access to promotions"],
  SILVER: ["1.25x points multiplier", "Free size upgrade monthly", "Priority support"],
  GOLD: ["1.5x points multiplier", "Free drink monthly", "Exclusive tastings", "Skip the line"],
  PLATINUM: ["2x points multiplier", "Free drink weekly", "VIP events", "Personal barista"],
})

const getTierProgress = (tier: string) => {
  switch (tier) {
    case "BRONZE": return { min: 0, max: 1000, color: "from-orange-400 to-orange-600" }
    case "SILVER": return { min: 1000, max: 5000, color: "from-slate-400 to-slate-600" }
    case "GOLD": return { min: 5000, max: 15000, color: "from-amber-400 to-amber-600" }
    case "PLATINUM": return { min: 15000, max: 50000, color: "from-violet-400 to-violet-600" }
    default: return { min: 0, max: 1000, color: "from-orange-400 to-orange-600" }
  }
}

const getNextTier = (tier: string) => {
  switch (tier) {
    case "BRONZE": return "SILVER"
    case "SILVER": return "GOLD"
    case "GOLD": return "PLATINUM"
    case "PLATINUM": return "PLATINUM"
    default: return "SILVER"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export default function LoyaltyPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards")
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    const fetchData = async () => {
      if (sessionStatus === "loading") return
      if (!session) {
        setLoading(false)
        return
      }

      try {
        // Fetch customer profile
        const profileRes = await fetch("/api/customer/me")
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)

          const pointsRes = await fetch(`/api/loyalty/points?customerId=${profileData.id}`)
          if (pointsRes.ok) {
            const pointsData = await pointsRes.json()
            setTransactions(pointsData.transactions || [])
          }
        }
      } catch (err) {
        console.error("Error fetching loyalty data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, sessionStatus])

  const customerLoyalty = profile?.loyalty || {
    pointsBalance: 0,
    lifetimePoints: 0,
    tier: "BRONZE",
  }

  const tierProgress = getTierProgress(customerLoyalty.tier)
  const nextTier = getNextTier(customerLoyalty.tier)
  const pointsToNextTier = tierProgress.max - customerLoyalty.lifetimePoints
  const progressPercent = ((customerLoyalty.lifetimePoints - tierProgress.min) / (tierProgress.max - tierProgress.min)) * 100
  
  // Use default currency (MYR)
  const currencyInfo = getCurrencyInfo('MYR')
  const availableRewards = getAvailableRewards(formatCurrency)
  const tierBenefits = getTierBenefits(currencyInfo.symbol)

  // Mock streak data (could be fetched from API)
  const streakDays = 7

  const rawPhone = profile?.user?.phone || null
  const normalizedPhone = rawPhone ? rawPhone.replace(/[\s\-\(\)]/g, "") : ""

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-espresso-900">Sign in to view rewards</h2>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header with Points */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950" />
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-40 h-40 bg-cream-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-espresso-700/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white font-display">Rewards</h1>
            <Badge className={cn("bg-white/20 text-white backdrop-blur-sm", getTierColor(customerLoyalty.tier))}>
              <Trophy className="w-3 h-3 mr-1" />
              {customerLoyalty.tier}
            </Badge>
          </div>

          {/* Points Balance */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-6 h-6 text-cream-200" />
              <span className="text-5xl font-bold text-white font-display">
                {formatPoints(customerLoyalty.pointsBalance)}
              </span>
            </div>
            <p className="text-cream-200 text-sm">Available points</p>
          </motion.div>

          {/* Tier Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cream-200">{customerLoyalty.tier}</span>
              <span className="text-sm text-cream-200">{nextTier}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full bg-gradient-to-r", tierProgress.color)}
              />
            </div>
            <p className="text-xs text-cream-300 text-center">
              {customerLoyalty.tier === "PLATINUM" ? (
                "You've reached the highest tier! 🎉"
              ) : (
                <>
                  <span className="font-semibold">{formatPoints(Math.max(0, pointsToNextTier))}</span> points to {nextTier}
                </>
              )}
            </p>
          </div>

          {/* Streak */}
          {streakDays > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-cream-200">
                {streakDays}-day streak! Keep it going for bonus points
              </span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-cream-50 border-b border-cream-200/50 px-4">
        <div className="flex gap-4">
          {(["rewards", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                activeTab === tab
                  ? "border-espresso-800 text-espresso-900"
                  : "border-transparent text-espresso-500 hover:text-espresso-700"
              )}
            >
              {tab === "rewards" ? "Rewards" : "History"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === "rewards" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Card className="border-cream-200/50">
              <CardContent className="p-4">
                {rawPhone ? (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white border border-cream-200">
                      <QRCode value={normalizedPhone} size={160} bgColor="transparent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-espresso-900">Your QR Code</h3>
                      <p className="text-sm text-espresso-600 mt-1">
                        Cafe can scan this code or enter your phone number to log points.
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-espresso-500">Phone:</span>{" "}
                        <span className="font-medium text-espresso-900">{rawPhone}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 ml-2"
                          onClick={() => navigator.clipboard?.writeText(rawPhone)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-espresso-900">Add your phone number</h3>
                      <p className="text-sm text-espresso-600">
                        To get a scannable QR, add a phone number to your profile.
                      </p>
                    </div>
                    <Button asChild size="sm" className="h-9">
                      <Link href="/profile/settings">Go to Settings</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Vouchers */}
            {profile?.vouchers && profile.vouchers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">My Vouchers ({profile.vouchers.length})</h3>
                <div className="space-y-2">
                  {profile.vouchers.map((voucher) => (
                    <Card key={voucher.id} className="border-green-200 bg-green-50/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-espresso-900">{voucher.type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-espresso-500">
                              Code: {voucher.code} · Expires {new Date(voucher.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Rewards */}
            <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Redeem Points</h3>
            <div className="grid gap-3">
              {availableRewards.map((reward, index) => {
                const canAfford = customerLoyalty.pointsBalance >= reward.pointsCost
                
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "overflow-hidden border-cream-200/50",
                      !canAfford && "opacity-60"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-2xl">
                            {reward.image}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-espresso-900">{reward.name}</h3>
                              <div className="flex items-center gap-1 bg-espresso-100 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-espresso-600" />
                                <span className="text-xs font-bold text-espresso-800">
                                  {formatPoints(reward.pointsCost)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-espresso-600 mb-2">{reward.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-espresso-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Valid for {reward.expiresIn}
                              </span>
                              <Button 
                                size="sm" 
                                className="h-8"
                                disabled={!canAfford}
                              >
                                {canAfford ? "Redeem" : "Not enough points"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Tier Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-cream-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className={cn("w-5 h-5", getTierColor(customerLoyalty.tier).split(" ")[0])} />
                    <h3 className="font-semibold text-espresso-900">Your {customerLoyalty.tier} Benefits</h3>
                  </div>
                  <div className="space-y-2">
                    {tierBenefits[customerLoyalty.tier as keyof typeof tierBenefits]?.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-espresso-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <Button asChild variant="ghost" className="w-full justify-between h-10">
                    <Link href="/loyalty/tiers">
                      View all tiers
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-espresso-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-espresso-700 mb-2">No transactions yet</h3>
                <p className="text-sm text-espresso-500">Start earning points by making purchases!</p>
              </div>
            ) : (
              transactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-white rounded-xl border border-cream-200/50"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    txn.type === "EARN" && "bg-green-100 text-green-600",
                    txn.type === "REDEEM" && "bg-blue-100 text-blue-600",
                    txn.type === "BONUS" && "bg-amber-100 text-amber-600",
                  )}>
                    {txn.type === "EARN" && <TrendingUp className="w-5 h-5" />}
                    {txn.type === "REDEEM" && <Gift className="w-5 h-5" />}
                    {txn.type === "BONUS" && <Zap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-espresso-900">{txn.description}</p>
                    <p className="text-xs text-espresso-500">{formatDate(txn.createdAt)}</p>
                  </div>
                  <div className={cn(
                    "font-bold",
                    txn.points > 0 ? "text-green-600" : "text-espresso-600"
                  )}>
                    {txn.points > 0 ? "+" : ""}{formatPoints(txn.points)}
                  </div>
                </motion.div>
              ))
            )}

            {transactions.length > 0 && (
              <Button variant="ghost" className="w-full mt-4">
                Load more
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
