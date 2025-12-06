"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  ArrowLeft,
  Package,
  Clock,
  Coffee,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle
} from "lucide-react"
import { cn, formatCurrency, getOrderStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  modifiers: any
  notes: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  orderType: string
  cafe: {
    id: string
    name: string
    slug: string
    image: string | null
    address: string | null
  }
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  tipAmount: number
  total: number
  pointsEarned: number
  pointsRedeemed: number
  notes: string | null
  createdAt: string
  completedAt: string | null
  paymentMethod: string | null
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Circle className="w-4 h-4" />
    case "PREPARING":
      return <Loader2 className="w-4 h-4 animate-spin" />
    case "READY":
      return <Package className="w-4 h-4" />
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4" />
    case "CANCELLED":
      return <XCircle className="w-4 h-4" />
    default:
      return <Circle className="w-4 h-4" />
  }
}

const OrderStatusProgress = ({ status }: { status: string }) => {
  const steps = ["PENDING", "PREPARING", "READY", "COMPLETED"]
  const currentIndex = steps.indexOf(status)

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 rounded-xl">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-cream-50 rounded-xl">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isActive ? "bg-espresso-800 text-white" : "bg-cream-200 text-espresso-400",
                  isCurrent && "scale-110"
                )}
              >
                {getStatusIcon(step)}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                isActive ? "text-espresso-800" : "text-espresso-400"
              )}>
                {step === "PENDING" ? "Received" : step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1 transition-colors",
                index < currentIndex ? "bg-espresso-800" : "bg-cream-300"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const formatOrderDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "past">("active")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const handleBack = useCallback(() => {
    router.push('/home')
  }, [router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionStatus === "loading") return
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/customer/orders")
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session, sessionStatus])

  const activeOrders = orders.filter(o => 
    ["PENDING", "PREPARING", "READY"].includes(o.status)
  )
  const pastOrders = orders.filter(o => 
    ["COMPLETED", "CANCELLED"].includes(o.status)
  )
  const activeOrder = activeOrders[0]

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-espresso-900">Sign in to view orders</h2>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-in fade-in duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-espresso-900 font-display">Your Orders</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[53px] z-30 bg-cream-50 border-b border-cream-200/50 px-4">
        <div className="flex gap-4">
          {(["active", "past"] as const).map((tab) => (
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
              {tab === "active" ? (
                <>Active {activeOrders.length > 0 && <Badge className="ml-1 bg-green-100 text-green-700 text-[10px]">{activeOrders.length}</Badge>}</>
              ) : (
                "Past Orders"
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeTab === "active" ? (
          activeOrder ? (
            <Card className="border-cream-200/50 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-espresso-700 to-espresso-800 p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-cream-200">Order #{activeOrder.orderNumber}</p>
                    <h2 className="font-bold">{activeOrder.cafe.name}</h2>
                  </div>
                  <Badge className="bg-white/20 text-white backdrop-blur-sm">
                    {activeOrder.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-cream-200">
                  <Clock className="w-4 h-4" />
                  <span>Ordered {formatOrderDate(activeOrder.createdAt)}</span>
                </div>
              </div>

              <CardContent className="p-4">
                <OrderStatusProgress status={activeOrder.status} />

                <Separator className="my-4" />

                {/* Order Items */}
                <div className="space-y-3">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center">
                        <Coffee className="w-4 h-4 text-espresso-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-espresso-900">{item.quantity}x {item.name}</p>
                          <span className="text-sm text-espresso-700">{formatCurrency(item.total)}</span>
                        </div>
                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                          <p className="text-xs text-espresso-500">
                            {Object.entries(item.modifiers).map(([key, val]) => `${val}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-espresso-900">Total</span>
                  <span className="font-bold text-espresso-900">{formatCurrency(activeOrder.total)}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-espresso-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-espresso-700 mb-2">No active orders</h3>
              <p className="text-sm text-espresso-500 mb-4">Your current orders will appear here</p>
              <Link href="/explore">
                <Button>Find a Cafe</Button>
              </Link>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {pastOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-espresso-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-espresso-700 mb-2">No past orders</h3>
                <p className="text-sm text-espresso-500 mb-4">Your order history will appear here</p>
                <Link href="/explore">
                  <Button>Find a Cafe</Button>
                </Link>
              </div>
            ) : (
              pastOrders.map((order) => {
                const isExpanded = expandedOrder === order.id
                
                return (
                  <Card key={order.id} className="border-cream-200/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center overflow-hidden">
                            {order.cafe.image ? (
                              <img src={order.cafe.image} alt={order.cafe.name} className="w-full h-full object-cover" />
                            ) : (
                              <Coffee className="w-6 h-6 text-espresso-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-espresso-900">{order.cafe.name}</h3>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-espresso-500">
                              <span>#{order.orderNumber}</span>
                              <span>{formatOrderDate(order.createdAt)}</span>
                              <span className="font-semibold text-espresso-700">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                          <ChevronDown className={cn(
                            "w-5 h-5 text-espresso-400 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-cream-200/50">
                          {/* Order Items */}
                          <div className="space-y-2 py-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-espresso-700">
                                  {item.quantity}x {item.name}
                                  {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                    <span className="text-espresso-500 text-xs"> · {Object.values(item.modifiers).join(', ')}</span>
                                  )}
                                </span>
                                <span className="text-espresso-800">{formatCurrency(item.total)}</span>
                              </div>
                            ))}
                          </div>

                          {order.pointsEarned > 0 && (
                            <div className="flex items-center gap-2 text-xs text-green-600 mb-3">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Earned {order.pointsEarned} points</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Link href={`/order/${order.cafe.slug}`} className="flex-1">
                              <Button className="w-full" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reorder
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              Receipt
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
