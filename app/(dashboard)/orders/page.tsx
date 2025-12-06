"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Clock, 
  Coffee, 
  CheckCircle, 
  Search,
  Loader2,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn, getOrderStatusColor } from "@/lib/utils"
import { useCurrency } from "@/components/currency-context"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customer: string | null
  items: OrderItem[]
  total: number
  status: string
  orderType: string
  createdAt: string
}

interface StatusCounts {
  PENDING: number
  PREPARING: number
  READY: number
  COMPLETED: number
  CANCELLED: number
}

type Timeframe = "ALL" | "TODAY" | "LAST_12_HOURS" | "LAST_3_HOURS" | "THIS_WEEK" | "THIS_MONTH"

const statuses = ["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]
const timeframeOptions: { value: Timeframe; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "TODAY", label: "Today" },
  { value: "LAST_12_HOURS", label: "Last 12 hours" },
  { value: "LAST_3_HOURS", label: "Last 3 hours" },
]

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    PENDING: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  })
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [timeframe, setTimeframe] = useState<Timeframe>("ALL")

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (!cafeId) return
    
    if (showRefreshing) setRefreshing(true)
    
    try {
      const params = new URLSearchParams({ cafeId })
      if (activeStatus && activeStatus !== "ALL") params.append("status", activeStatus)
      if (timeframe && timeframe !== "ALL") params.append("timeframe", timeframe)

      const res = await fetch(`/api/dashboard/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setStatusCounts(data.counts)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
    setLoading(false)
    setRefreshing(false)
  }, [cafeId, activeStatus, timeframe])
  
  const handleRefresh = () => {
    fetchOrders(true)
  }

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (cafeId) {
      fetchOrders()
      // Refresh every 10 seconds for real-time updates
      const interval = setInterval(() => fetchOrders(), 10000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [cafeId, sessionStatus, fetchOrders])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const res = await fetch('/api/dashboard/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      
      if (res.ok) {
        toast({ title: "Success", description: `Order updated to ${newStatus}` })
        fetchOrders()
      } else {
        toast({ title: "Error", description: "Failed to update order", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" })
    }
    setUpdatingOrder(null)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeStatus === "ALL" || order.status === activeStatus
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 min ago"
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1 hour ago"
    return `${hours} hours ago`
  }

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
              You need to be associated with a cafe to view orders.
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
        <h1 className="text-2xl font-bold text-espresso-950 font-display">Orders</h1>
        <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.PENDING}</p>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.PREPARING}</p>
              <p className="text-sm text-blue-700">Preparing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{statusCounts.READY}</p>
              <p className="text-sm text-green-700">Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(status)}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeframe Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm text-muted-foreground">Timeframe:</span>
        <div className="flex gap-2 flex-wrap">
          {timeframeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeframe === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <Card 
            key={order.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedOrder?.id === order.id && "ring-2 ring-espresso-500"
            )}
            onClick={() => setSelectedOrder(order)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{order.orderNumber}</span>
                    <Badge variant="outline" className="text-xs">
                      {order.orderType.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customer || "Guest"} · {formatTimeAgo(order.createdAt)}
                  </p>
                </div>
                <Badge className={getOrderStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-bold">{formatCurrency(order.total)}</span>
                <div className="flex gap-2">
                  {order.status === "PENDING" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={updatingOrder === order.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateOrderStatus(order.id, "PREPARING")
                      }}
                    >
                      {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Preparing"}
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button 
                      size="sm" 
                      variant="success"
                      disabled={updatingOrder === order.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateOrderStatus(order.id, "READY")
                      }}
                    >
                      {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Ready"}
                    </Button>
                  )}
                  {order.status === "READY" && (
                    <Button 
                      size="sm"
                      disabled={updatingOrder === order.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateOrderStatus(order.id, "COMPLETED")
                      }}
                    >
                      {updatingOrder === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Coffee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-muted-foreground">
              {orders.length === 0 ? "No orders yet. Orders will appear here when created from the POS." : "Try adjusting your filters"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
