"use client"

import { useEffect, useState } from "react"
import { 
  Users, 
  Search,
  Mail,
  Calendar,
  Shield,
  Coffee,
  Crown,
  UserCircle,
  Star,
  Gift,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: string
  customer: {
    id: string
    tier: string
    pointsBalance: number
    lifetimeSpend: number
    totalOrders: number
  } | null
  staffProfiles: {
    id: string
    role: string
    cafe: {
      id: string
      name: string
    }
  }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "customers" | "staff" | "owners">("all")
  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    staff: 0,
    owners: 0
  })

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/admin/users?search=${search}&filter=${filter}`)
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
          setStats(data.stats || stats)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [search, filter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return <Shield className="w-4 h-4" />
      case "OWNER":
        return <Crown className="w-4 h-4" />
      case "MANAGER":
      case "STAFF":
        return <Coffee className="w-4 h-4" />
      default:
        return <UserCircle className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "OWNER":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "MANAGER":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "STAFF":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "from-slate-300 to-slate-400"
      case "GOLD":
        return "from-amber-400 to-yellow-500"
      case "SILVER":
        return "from-slate-400 to-slate-500"
      default:
        return "from-orange-400 to-orange-600"
    }
  }

  const filteredUsers = users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-slate-400 mt-1">Manage all users on the Sippy platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Customers</p>
                <p className="text-xl font-bold text-white">{stats.customers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Staff</p>
                <p className="text-xl font-bold text-white">{stats.staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Cafe Owners</p>
                <p className="text-xl font-bold text-white">{stats.owners}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "customers", "staff", "owners"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No users found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-slate-900/50 border-slate-800/50 overflow-hidden hover:border-slate-700/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 ring-2 ring-slate-700">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{user.name || "Unnamed User"}</h3>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                      {user.customer && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs bg-gradient-to-r ${getTierColor(user.customer.tier)} bg-clip-text text-transparent border-none`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {user.customer.tier}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {user.staffProfiles.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">Works at:</span>
                        {user.staffProfiles.map((sp) => (
                          <Badge key={sp.id} variant="outline" className="text-xs border-slate-700 text-slate-400">
                            {sp.cafe.name} ({sp.role})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {user.customer && (
                    <div className="hidden lg:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Points</p>
                        <p className="text-lg font-bold text-amber-400 flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {user.customer.pointsBalance}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Orders</p>
                        <p className="text-lg font-bold text-white">
                          {user.customer.totalOrders}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Lifetime Spend</p>
                        <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {formatCurrency(user.customer.lifetimeSpend)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Stats for Customers */}
                {user.customer && (
                  <div className="lg:hidden grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/50">
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500">Points</p>
                      <p className="text-sm font-bold text-amber-400">{user.customer.pointsBalance}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500">Orders</p>
                      <p className="text-sm font-bold text-white">{user.customer.totalOrders}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500">Spend</p>
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(user.customer.lifetimeSpend)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

