"use client"

import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Coffee,
  Calendar,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

// Mock data
const periodStats = {
  revenue: { current: 12450, previous: 11200 },
  orders: { current: 856, previous: 792 },
  avgTicket: { current: 14.54, previous: 14.14 },
  customers: { current: 234, previous: 198 },
}

const hourlyData = [
  { hour: "6am", orders: 12, revenue: 68 },
  { hour: "7am", orders: 34, revenue: 187 },
  { hour: "8am", orders: 67, revenue: 389 },
  { hour: "9am", orders: 45, revenue: 256 },
  { hour: "10am", orders: 38, revenue: 215 },
  { hour: "11am", orders: 42, revenue: 312 },
  { hour: "12pm", orders: 56, revenue: 445 },
  { hour: "1pm", orders: 48, revenue: 367 },
  { hour: "2pm", orders: 35, revenue: 198 },
  { hour: "3pm", orders: 41, revenue: 234 },
  { hour: "4pm", orders: 29, revenue: 156 },
  { hour: "5pm", orders: 18, revenue: 98 },
]

const topProducts = [
  { name: "Flat White", orders: 156, revenue: 858.00, growth: 12 },
  { name: "Long Black", orders: 134, revenue: 603.00, growth: 8 },
  { name: "Oat Latte", orders: 98, revenue: 637.00, growth: 24 },
  { name: "Cappuccino", orders: 87, revenue: 478.50, growth: -3 },
  { name: "Cold Brew", orders: 76, revenue: 418.00, growth: 18 },
]

const customerInsights = [
  { label: "Repeat Rate", value: "67%", change: 5 },
  { label: "Avg. Visits/Month", value: "4.2", change: 0.3 },
  { label: "Loyalty Signup", value: "34%", change: 8 },
  { label: "Cross-Cafe Visits", value: "12%", change: 2 },
]

export default function AnalyticsPage() {
  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1)
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
          change={parseFloat(calculateChange(periodStats.revenue.current, periodStats.revenue.previous))}
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value={periodStats.orders.current.toString()}
          change={parseFloat(calculateChange(periodStats.orders.current, periodStats.orders.previous))}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Avg. Ticket"
          value={formatCurrency(periodStats.avgTicket.current)}
          change={parseFloat(calculateChange(periodStats.avgTicket.current, periodStats.avgTicket.previous))}
          icon={Coffee}
        />
        <MetricCard
          title="Customers"
          value={periodStats.customers.current.toString()}
          change={parseFloat(calculateChange(periodStats.customers.current, periodStats.customers.previous))}
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
            <div className="space-y-3">
              {hourlyData.map((hour) => {
                const maxOrders = Math.max(...hourlyData.map(h => h.orders))
                const percentage = (hour.orders / maxOrders) * 100
                
                return (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-muted-foreground">{hour.hour}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-espresso-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-medium">{hour.orders}</span>
                      <span className="text-muted-foreground text-sm"> orders</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performers this period</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Badge variant={insight.change >= 0 ? "success" : "destructive"}>
                    {insight.change >= 0 ? "+" : ""}{insight.change}%
                  </Badge>
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

