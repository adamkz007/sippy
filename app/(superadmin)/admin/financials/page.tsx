"use client"

import { useEffect, useState } from "react"
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Store,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FinancialStats {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    thisMonth: number
    averageValue: number
    completedRate: number
  }
  payments: {
    cash: number
    card: number
    mobile: number
    cashPercentage: number
    cardPercentage: number
    mobilePercentage: number
  }
  topCafes: {
    id: string
    name: string
    revenue: number
    orders: number
  }[]
  monthlyRevenue: {
    month: string
    revenue: number
    orders: number
  }[]
}

export default function FinancialsPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/financials")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch financial stats:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Financials</h1>
        <p className="text-slate-400 mt-1">Platform-wide financial overview and metrics</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-400/80">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(stats?.revenue.total || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {(stats?.revenue.growth || 0) >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${(stats?.revenue.growth || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {stats?.revenue.growth || 0}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">This Month</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats?.revenue.thisMonth || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              vs {formatCurrency(stats?.revenue.lastMonth || 0)} last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Avg. Order Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats?.orders.averageValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Across {formatNumber(stats?.orders.total || 0)} orders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Completion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {(stats?.orders.completedRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Orders completed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Payment Methods</CardTitle>
          <CardDescription className="text-slate-400">Revenue breakdown by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Cash</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(stats?.payments.cash || 0)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stats?.payments.cashPercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{(stats?.payments.cashPercentage || 0).toFixed(1)}% of total</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Card</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(stats?.payments.card || 0)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stats?.payments.cardPercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{(stats?.payments.cardPercentage || 0).toFixed(1)}% of total</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Mobile/Other</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(stats?.payments.mobile || 0)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${stats?.payments.mobilePercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{(stats?.payments.mobilePercentage || 0).toFixed(1)}% of total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Cafes */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Cafes</CardTitle>
          <CardDescription className="text-slate-400">Cafes with highest revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.topCafes || []).length === 0 ? (
              <p className="text-slate-500 text-center py-8">No cafe data available yet</p>
            ) : (
              stats?.topCafes.map((cafe, index) => (
                <div key={cafe.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                      index === 0 ? "bg-amber-500/20 text-amber-400" :
                      index === 1 ? "bg-slate-400/20 text-slate-400" :
                      index === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-slate-700/50 text-slate-500"
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cafe.name}</p>
                      <p className="text-xs text-slate-500">{formatNumber(cafe.orders)} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(cafe.revenue)}</p>
                    <p className="text-xs text-slate-500">Total revenue</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Monthly Revenue Trend</CardTitle>
          <CardDescription className="text-slate-400">Revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-48">
            {(stats?.monthlyRevenue || []).map((month, index) => {
              const maxRevenue = Math.max(...(stats?.monthlyRevenue || []).map(m => m.revenue), 1)
              const height = (month.revenue / maxRevenue) * 100
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all hover:from-amber-400 hover:to-amber-300"
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: '16px' }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                      {formatCurrency(month.revenue)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{month.month}</p>
                </div>
              )
            })}
            {(stats?.monthlyRevenue || []).length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

