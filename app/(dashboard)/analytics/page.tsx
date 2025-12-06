"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Coffee,
  Calendar,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/currency-context"

interface PeriodStats {
  revenue: { current: number; previous: number }
  orders: { current: number; previous: number }
  avgTicket: { current: number; previous: number }
  customers: { current: number; previous: number }
}

interface HourlyData {
  hour: string
  orders: number
  revenue: number
}

interface TopProduct {
  name: string
  orders: number
  revenue: number
  growth: number
}

interface CustomerInsight {
  label: string
  value: string
  change: number
}

export default function AnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { formatCurrency } = useCurrency()
  
  const [loading, setLoading] = useState(true)
  const [periodStats, setPeriodStats] = useState<PeriodStats>({
    revenue: { current: 0, previous: 0 },
    orders: { current: 0, previous: 0 },
    avgTicket: { current: 0, previous: 0 },
    customers: { current: 0, previous: 0 },
  })
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([])

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const fetchAnalytics = useCallback(async () => {
    if (!cafeId) return
    
    try {
      const res = await fetch(`/api/dashboard/analytics?cafeId=${cafeId}&days=7`)
      if (res.ok) {
        const data = await res.json()
        setPeriodStats(data.periodStats)
        setHourlyData(data.hourlyData)
        setTopProducts(data.topProducts)
        setCustomerInsights(data.customerInsights)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
    setLoading(false)
  }, [cafeId])

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (cafeId) {
      fetchAnalytics()
    } else {
      setLoading(false)
    }
  }, [cafeId, sessionStatus, fetchAnalytics])

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  const maxOrders = Math.max(...hourlyData.map((h) => h.orders), 1)

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
              You need to be associated with a cafe to view analytics.
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
          <h1 className="text-2xl font-bold text-espresso-950 font-display">Analytics</h1>
          <p className="text-muted-foreground">Performance insights for your cafe</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={formatCurrency(periodStats.revenue.current)}
          change={calculateChange(periodStats.revenue.current, periodStats.revenue.previous)}
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value={periodStats.orders.current.toString()}
          change={calculateChange(periodStats.orders.current, periodStats.orders.previous)}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Avg. Ticket"
          value={formatCurrency(periodStats.avgTicket.current)}
          change={calculateChange(periodStats.avgTicket.current, periodStats.avgTicket.previous)}
          icon={Coffee}
        />
        <MetricCard
          title="Customers"
          value={periodStats.customers.current.toString()}
          change={0}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity</CardTitle>
            <CardDescription>Orders and revenue by hour today</CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="w-8 h-8 mx-auto mb-2" />
                <p>No activity data yet</p>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-56">
                {hourlyData.map((hour) => {
                  const barHeight = (hour.orders / maxOrders) * 100

                  return (
                    <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-medium text-espresso-900">{hour.orders}</div>
                      <div className="w-full bg-muted rounded-md overflow-hidden h-40 flex items-end">
                        <div
                          className="w-full bg-espresso-500 rounded-md transition-all"
                          style={{ height: `${barHeight}%`, minHeight: hour.orders > 0 ? "6px" : "0px" }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{hour.hour}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Orders per hour</span>
                <span>Peak: {maxOrders}</span>
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performers this period</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="w-8 h-8 mx-auto mb-2" />
                <p>No sales data yet</p>
              </div>
            ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-espresso-100 flex items-center justify-center text-sm font-bold text-espresso-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.revenue)}</p>
                    <div className={`flex items-center justify-end text-xs ${product.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {product.growth >= 0 ? "+" : ""}{product.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Loyalty and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {customerInsights.map((insight) => (
                <div key={insight.label} className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-3xl font-bold">{insight.value}</p>
                  <p className="text-sm text-muted-foreground mb-2">{insight.label}</p>
                  {insight.change !== 0 && (
                  <Badge variant={insight.change >= 0 ? "success" : "destructive"}>
                    {insight.change >= 0 ? "+" : ""}{insight.change}%
                  </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string
  value: string
  change: number
  icon: React.ElementType
}) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{change}% vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}
