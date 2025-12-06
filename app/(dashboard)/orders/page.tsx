"use client"

import { useState } from "react"
import { 
  Clock, 
  Coffee, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  Filter,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency, getOrderStatusColor } from "@/lib/utils"

// Mock data
const mockOrders = [
  { 
    id: "1", 
    orderNumber: "A-042", 
    customer: "Alex Smith", 
    items: [
      { name: "Flat White", quantity: 2, price: 5.50 },
      { name: "Croissant", quantity: 1, price: 5.50 },
    ],
    total: 16.50,
    status: "PREPARING",
    orderType: "TAKEAWAY",
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  { 
    id: "2", 
    orderNumber: "A-041", 
    customer: null, 
    items: [
      { name: "Long Black", quantity: 1, price: 4.50 },
    ],
    total: 4.50,
    status: "READY",
    orderType: "TAKEAWAY",
    createdAt: new Date(Date.now() - 8 * 60000),
  },
  { 
    id: "3", 
    orderNumber: "A-040", 
    customer: "Maya Kim", 
    items: [
      { name: "Oat Latte", quantity: 1, price: 6.50 },
      { name: "Avocado Toast", quantity: 1, price: 16.00 },
    ],
    total: 22.50,
    status: "PENDING",
    orderType: "DINE_IN",
    createdAt: new Date(Date.now() - 2 * 60000),
  },
  { 
    id: "4", 
    orderNumber: "A-039", 
    customer: "Jordan Taylor", 
    items: [
      { name: "Cold Brew", quantity: 2, price: 5.50 },
      { name: "Banana Bread", quantity: 2, price: 6.50 },
    ],
    total: 24.00,
    status: "COMPLETED",
    orderType: "PICKUP",
    createdAt: new Date(Date.now() - 15 * 60000),
  },
]

const statuses = ["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)

  const filteredOrders = mockOrders.filter((order) => {
    const matchesStatus = activeStatus === "ALL" || order.status === activeStatus
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const ordersByStatus = {
    PENDING: mockOrders.filter(o => o.status === "PENDING").length,
    PREPARING: mockOrders.filter(o => o.status === "PREPARING").length,
    READY: mockOrders.filter(o => o.status === "READY").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-espresso-950 font-display">Orders</h1>
        <p className="text-muted-foreground">Manage and track all orders</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{ordersByStatus.PENDING}</p>
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
              <p className="text-2xl font-bold text-blue-900">{ordersByStatus.PREPARING}</p>
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
              <p className="text-2xl font-bold text-green-900">{ordersByStatus.READY}</p>
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
        <div className="flex gap-2">
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
                    <Button size="sm" variant="outline">
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button size="sm" variant="success">
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "READY" && (
                    <Button size="sm">
                      Complete
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
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return "Just now"
  if (minutes === 1) return "1 min ago"
  if (minutes < 60) return `${minutes} mins ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return "1 hour ago"
  return `${hours} hours ago`
}

