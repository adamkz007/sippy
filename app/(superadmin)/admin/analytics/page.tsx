"use client"

import { useEffect, useState } from "react"
import { 
  BarChart3, 
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  Clock,
  Coffee
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  dailyOrders: {
    date: string
    count: number
    revenue: number
  }[]
  hourlyDistribution: {
    hour: number
    count: number
  }[]
  topProducts: {
    name: string
    count: number
    revenue: number
  }[]
  ordersByType: {
    type: string
    count: number
    percentage: number
  }[]
  customerGrowth: {
    month: string
    newCustomers: number
    totalCustomers: number
  }[]
  conversionMetrics: {
    browseToOrder: number
    repeatCustomerRate: number
    avgOrdersPerCustomer: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/admin/analytics?period=${period}`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-slate-400 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p 
                  ? "bg-amber-500 text-white" 
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Browse to Order</p>
                <p className="text-2xl font-bold text-white">
                  {(analytics?.conversionMetrics.browseToOrder || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Repeat Customer Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(analytics?.conversionMetrics.repeatCustomerRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Orders/Customer</p>
                <p className="text-2xl font-bold text-white">
                  {(analytics?.conversionMetrics.avgOrdersPerCustomer || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Type */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Orders by Type</CardTitle>
          <CardDescription className="text-slate-400">Distribution of order types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(analytics?.ordersByType || []).map((type) => (
              <div key={type.type} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400 capitalize">{type.type.toLowerCase().replace("_", " ")}</p>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {type.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-white">{type.count}</p>
                <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {(analytics?.ordersByType || []).length === 0 && (
              <p className="col-span-4 text-center text-slate-500 py-4">No order data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Peak Hours
          </CardTitle>
          <CardDescription className="text-slate-400">Order distribution by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {Array.from({ length: 24 }, (_, hour) => {
              const data = analytics?.hourlyDistribution.find(h => h.hour === hour)
              const count = data?.count || 0
              const maxCount = Math.max(...(analytics?.hourlyDistribution || []).map(h => h.count), 1)
              const height = (count / maxCount) * 100
              const isPeak = height > 60
              
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full relative">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        isPeak 
                          ? "bg-gradient-to-t from-amber-500 to-orange-400" 
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1 py-0.5 rounded text-xs text-white whitespace-nowrap">
                      {count}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600">{hour}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">Hour of day (24h format)</p>
        </CardContent>
      </Card>

      {/* Top Products and Customer Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              Top Products
            </CardTitle>
            <CardDescription className="text-slate-400">Best selling items across all cafes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics?.topProducts || []).length === 0 ? (
              <p className="text-slate-500 text-center py-4">No product data available</p>
            ) : (
              analytics?.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-amber-500/20 text-amber-400" :
                      index === 1 ? "bg-slate-400/20 text-slate-400" :
                      index === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-slate-700/50 text-slate-500"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.count} sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-emerald-400">{formatCurrency(product.revenue)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Customer Growth
            </CardTitle>
            <CardDescription className="text-slate-400">New customer registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics?.customerGrowth || []).length === 0 ? (
              <p className="text-slate-500 text-center py-4">No customer data available</p>
            ) : (
              analytics?.customerGrowth.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{month.month}</p>
                      <p className="text-xs text-slate-500">{month.totalCustomers} total</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +{month.newCustomers}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Orders Chart */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Daily Orders</CardTitle>
          <CardDescription className="text-slate-400">Order volume over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-48">
            {(analytics?.dailyOrders || []).map((day, index) => {
              const maxCount = Math.max(...(analytics?.dailyOrders || []).map(d => d.count), 1)
              const height = (day.count / maxCount) * 100
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                  <div className="w-full relative">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t transition-all hover:from-blue-400 hover:to-cyan-300"
                      style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10">
                      {day.count} orders<br/>
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                </div>
              )
            })}
            {(analytics?.dailyOrders || []).length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">
              {analytics?.dailyOrders?.[0]?.date || "Start"}
            </span>
            <span className="text-xs text-slate-500">
              {analytics?.dailyOrders?.[analytics.dailyOrders.length - 1]?.date || "End"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

