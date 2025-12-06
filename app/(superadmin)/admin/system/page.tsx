"use client"

import { useEffect, useState } from "react"
import { 
  Database, 
  Server,
  Activity,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SystemStatus {
  database: {
    status: "healthy" | "degraded" | "down"
    latency: number
    connections: number
  }
  services: {
    name: string
    status: "healthy" | "degraded" | "down"
    uptime: string
    lastChecked: string
  }[]
  stats: {
    totalRecords: {
      users: number
      cafes: number
      orders: number
      products: number
    }
    storageUsed: string
  }
}

export default function SystemPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/system")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatus()
  }

  const getStatusColor = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "degraded":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "down":
        return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const getStatusIcon = (status: "healthy" | "degraded" | "down") => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4" />
      case "degraded":
        return <AlertCircle className="w-4 h-4" />
      case "down":
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">System Status</h1>
          <p className="text-slate-400 mt-1">Monitor platform health and infrastructure</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-slate-800 hover:bg-slate-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Database Status */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Database</CardTitle>
                <CardDescription className="text-slate-400">PostgreSQL via Prisma</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(status?.database.status || "healthy")}>
              {getStatusIcon(status?.database.status || "healthy")}
              <span className="ml-1 capitalize">{status?.database.status || "Healthy"}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Latency</span>
              </div>
              <p className="text-2xl font-bold text-white">{status?.database.latency || 0}ms</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Active Connections</span>
              </div>
              <p className="text-2xl font-bold text-white">{status?.database.connections || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {(status?.services || []).map((service) => (
          <Card key={service.name} className="bg-slate-900/50 border-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{service.name}</p>
                    <p className="text-xs text-slate-500">Last checked: {service.lastChecked}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(service.status)}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1 capitalize">{service.status}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Uptime: {service.uptime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Stats */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            Database Records
          </CardTitle>
          <CardDescription className="text-slate-400">Total records across all tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-3xl font-bold text-white">{status?.stats.totalRecords.users || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Users</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-3xl font-bold text-white">{status?.stats.totalRecords.cafes || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Cafes</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-3xl font-bold text-white">{status?.stats.totalRecords.orders || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Orders</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className="text-3xl font-bold text-white">{status?.stats.totalRecords.products || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Products</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Environment</CardTitle>
          <CardDescription className="text-slate-400">Current deployment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Environment</p>
              <p className="font-semibold text-white capitalize">{process.env.NODE_ENV || "development"}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Framework</p>
              <p className="font-semibold text-white">Next.js 14</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Storage Used</p>
              <p className="font-semibold text-white">{status?.stats.storageUsed || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

