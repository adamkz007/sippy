"use client"

import { useEffect, useState } from "react"
import { 
  Store, 
  Users, 
  DollarSign, 
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Coffee,
  ArrowUpRight,
  Gift,
  Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  cafes: {
    total: number
    active: number
    newThisMonth: number
  }
  users: {
    total: number
    customers: number
    staff: number
    newThisMonth: number
  }
  orders: {
    total: number
    thisMonth: number
    averageValue: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
  }
  loyalty: {
    totalPoints: number
    totalVouchers: number
    activeVouchers: number
  }
}

interface RecentCafe {
  id: string
  name: string
  slug: string
  createdAt: string
  city: string | null
  ordersCount: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  cafe: { name: string }
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCafes, setRecentCafes] = useState<RecentCafe[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, cafesRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/cafes?limit=5"),
          fetch("/api/admin/orders?limit=5"),
        ])
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
        
        if (cafesRes.ok) {
          const cafesData = await cafesRes.json()
          setRecentCafes(cafesData.cafes || [])
        }
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setRecentOrders(ordersData.orders || [])
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
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

  const statCards = [
    {
      title: "Total Cafes",
      value: formatNumber(stats?.cafes.total || 0),
      change: `+${stats?.cafes.newThisMonth || 0} this month`,
      icon: Store,
      trend: "up",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Users",
      value: formatNumber(stats?.users.total || 0),
      change: `+${stats?.users.newThisMonth || 0} this month`,
      icon: Users,
      trend: "up",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.revenue.total || 0),
      change: `${(stats?.revenue.growth || 0) > 0 ? "+" : ""}${stats?.revenue.growth || 0}% growth`,
      icon: DollarSign,
      trend: (stats?.revenue.growth || 0) >= 0 ? "up" : "down",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Total Orders",
      value: formatNumber(stats?.orders.total || 0),
      change: `${formatNumber(stats?.orders.thisMonth || 0)} this month`,
      icon: ShoppingBag,
      trend: "up",
      gradient: "from-amber-500 to-orange-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's what's happening across Sippy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800/50 overflow-hidden group hover:border-slate-700/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-90 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Customers</p>
                <p className="text-xl font-bold text-white">{formatNumber(stats?.users.customers || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Staff Members</p>
                <p className="text-xl font-bold text-white">{formatNumber(stats?.users.staff || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg. Order Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats?.orders.averageValue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-amber-400/80">Total Points in Circulation</p>
                <p className="text-xl font-bold text-amber-400">{formatNumber(stats?.loyalty.totalPoints || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-violet-400/80">Total Vouchers Issued</p>
                <p className="text-xl font-bold text-violet-400">{formatNumber(stats?.loyalty.totalVouchers || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-400/80">Active Vouchers</p>
                <p className="text-xl font-bold text-emerald-400">{formatNumber(stats?.loyalty.activeVouchers || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Cafes */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Cafes</CardTitle>
                <CardDescription className="text-slate-400">Latest cafe registrations</CardDescription>
              </div>
              <a href="/admin/cafes" className="text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center gap-1">
                View all <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCafes.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No cafes registered yet</p>
            ) : (
              recentCafes.map((cafe) => (
                <div key={cafe.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {cafe.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{cafe.name}</p>
                      <p className="text-xs text-slate-500">{cafe.city || "No location"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">{cafe.ordersCount} orders</p>
                    <p className="text-xs text-slate-500">
                      {new Date(cafe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Orders</CardTitle>
                <CardDescription className="text-slate-400">Latest orders across all cafes</CardDescription>
              </div>
              <a href="/admin/analytics" className="text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center gap-1">
                View all <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      order.status === "COMPLETED" ? "bg-emerald-500/20" :
                      order.status === "PREPARING" ? "bg-amber-500/20" :
                      "bg-slate-700"
                    }`}>
                      <ShoppingBag className={`w-5 h-5 ${
                        order.status === "COMPLETED" ? "text-emerald-400" :
                        order.status === "PREPARING" ? "text-amber-400" :
                        "text-slate-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{order.cafe.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

