"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Gift, 
  Sparkles, 
  ChevronRight,
  Coffee,
  Star,
  Clock,
  Check,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react"
import { cn, formatCurrency, formatPoints, getTierColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock data
const customerLoyalty = {
  pointsBalance: 1250,
  lifetimePoints: 5420,
  tier: "GOLD",
  nextTier: "PLATINUM",
  pointsToNextTier: 9580,
  streakDays: 7,
}

const availableRewards = [
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
    name: "$5 Off",
    description: "On orders over $15",
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

const recentTransactions = [
  {
    id: "1",
    type: "EARN",
    points: 12,
    description: "Purchase at The Daily Grind",
    cafe: "The Daily Grind",
    date: "Today, 9:15 AM",
    orderId: "A-042",
  },
  {
    id: "2",
    type: "EARN",
    points: 8,
    description: "Purchase at Brew Lab",
    cafe: "Brew Lab",
    date: "Yesterday, 3:30 PM",
    orderId: "B-118",
  },
  {
    id: "3",
    type: "REDEEM",
    points: -500,
    description: "Redeemed Free Flat White",
    cafe: "Coffee Collective",
    date: "3 days ago",
    orderId: "C-055",
  },
  {
    id: "4",
    type: "BONUS",
    points: 50,
    description: "7-day streak bonus!",
    cafe: null,
    date: "3 days ago",
    orderId: null,
  },
]

const tierBenefits = {
  BRONZE: ["1 point per $1 spent", "Birthday reward", "Early access to promotions"],
  SILVER: ["1.25x points multiplier", "Free size upgrade monthly", "Priority support"],
  GOLD: ["1.5x points multiplier", "Free drink monthly", "Exclusive tastings", "Skip the line"],
  PLATINUM: ["2x points multiplier", "Free drink weekly", "VIP events", "Personal barista"],
}

const getTierProgress = (tier: string) => {
  switch (tier) {
    case "BRONZE": return { min: 0, max: 1000, color: "from-orange-400 to-orange-600" }
    case "SILVER": return { min: 1000, max: 5000, color: "from-slate-400 to-slate-600" }
    case "GOLD": return { min: 5000, max: 15000, color: "from-amber-400 to-amber-600" }
    case "PLATINUM": return { min: 15000, max: 50000, color: "from-violet-400 to-violet-600" }
    default: return { min: 0, max: 1000, color: "from-orange-400 to-orange-600" }
  }
}

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards")
  const tierProgress = getTierProgress(customerLoyalty.tier)
  const progressPercent = ((customerLoyalty.lifetimePoints - tierProgress.min) / (tierProgress.max - tierProgress.min)) * 100

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
              <span className="text-sm text-cream-200">{customerLoyalty.nextTier}</span>
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
              <span className="font-semibold">{formatPoints(customerLoyalty.pointsToNextTier)}</span> points to {customerLoyalty.nextTier}
            </p>
          </div>

          {/* Streak */}
          {customerLoyalty.streakDays > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-cream-200">
                {customerLoyalty.streakDays}-day streak! Keep it going for bonus points
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
            {/* Available Rewards */}
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
                  <Link href="/loyalty/tiers">
                    <Button variant="ghost" className="w-full justify-between h-10">
                      View all tiers
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
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
            {recentTransactions.map((txn, index) => (
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
                  <p className="text-xs text-espresso-500">{txn.date}</p>
                </div>
                <div className={cn(
                  "font-bold",
                  txn.points > 0 ? "text-green-600" : "text-espresso-600"
                )}>
                  {txn.points > 0 ? "+" : ""}{formatPoints(txn.points)}
                </div>
              </motion.div>
            ))}

            <Button variant="ghost" className="w-full mt-4">
              Load more
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

