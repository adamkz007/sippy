"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  Coffee,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Circle,
  Loader2
} from "lucide-react"
import { cn, formatCurrency, getOrderStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock orders data
const orders = [
  {
    id: "1",
    orderNumber: "A-042",
    cafe: "The Daily Grind",
    cafeSlug: "daily-grind",
    status: "PREPARING",
    items: [
      { name: "Flat White", quantity: 1, price: 5.50, modifiers: "Oat milk, extra shot" },
      { name: "Banana Bread", quantity: 1, price: 6.50, modifiers: null },
    ],
    total: 13.20,
    pointsEarned: 13,
    createdAt: "Today, 9:15 AM",
    estimatedReady: "9:25 AM",
    isActive: true,
  },
  {
    id: "2",
    orderNumber: "B-118",
    cafe: "Brew Lab",
    cafeSlug: "brew-lab",
    status: "COMPLETED",
    items: [
      { name: "Cold Brew", quantity: 2, price: 5.50, modifiers: "Large" },
    ],
    total: 12.10,
    pointsEarned: 12,
    createdAt: "Yesterday, 3:30 PM",
    estimatedReady: null,
    isActive: false,
  },
  {
    id: "3",
    orderNumber: "C-055",
    cafe: "Coffee Collective",
    cafeSlug: "coffee-collective",
    status: "COMPLETED",
    items: [
      { name: "Oat Latte", quantity: 1, price: 6.50, modifiers: null },
      { name: "Avocado Toast", quantity: 1, price: 16.00, modifiers: "Extra feta" },
    ],
    total: 24.75,
    pointsEarned: 0,
    createdAt: "3 days ago",
    estimatedReady: null,
    isActive: false,
  },
  {
    id: "4",
    orderNumber: "A-039",
    cafe: "The Daily Grind",
    cafeSlug: "daily-grind",
    status: "COMPLETED",
    items: [
      { name: "Long Black", quantity: 1, price: 4.50, modifiers: null },
    ],
    total: 4.95,
    pointsEarned: 5,
    createdAt: "5 days ago",
    estimatedReady: null,
    isActive: false,
  },
]

const activeOrder = orders.find(o => o.isActive)

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
    default:
      return <Circle className="w-4 h-4" />
  }
}

const OrderStatusProgress = ({ status }: { status: string }) => {
  const steps = ["PENDING", "PREPARING", "READY", "COMPLETED"]
  const currentIndex = steps.indexOf(status)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-cream-50 rounded-xl">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isActive ? "#6a320d" : "#f8f0e5"
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isActive ? "text-white" : "text-espresso-400"
                )}
              >
                {getStatusIcon(step)}
              </motion.div>
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

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "past">("active")

  const pastOrders = orders.filter(o => !o.isActive)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
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
                <>Active {activeOrder && <Badge className="ml-1 bg-green-100 text-green-700 text-[10px]">1</Badge>}</>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-cream-200/50 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-espresso-700 to-espresso-800 p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-cream-200">Order #{activeOrder.orderNumber}</p>
                      <h2 className="font-bold">{activeOrder.cafe}</h2>
                    </div>
                    <Badge className="bg-white/20 text-white backdrop-blur-sm">
                      {activeOrder.status}
                    </Badge>
                  </div>
                  {activeOrder.estimatedReady && (
                    <div className="flex items-center gap-2 text-sm text-cream-200">
                      <Clock className="w-4 h-4" />
                      <span>Estimated ready: <strong className="text-white">{activeOrder.estimatedReady}</strong></span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <OrderStatusProgress status={activeOrder.status} />

                  <Separator className="my-4" />

                  {/* Order Items */}
                  <div className="space-y-3">
                    {activeOrder.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center">
                          <Coffee className="w-4 h-4 text-espresso-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-espresso-900">{item.quantity}x {item.name}</p>
                            <span className="text-sm text-espresso-700">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                          {item.modifiers && (
                            <p className="text-xs text-espresso-500">{item.modifiers}</p>
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
            </motion.div>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {pastOrders.map((order, index) => {
              const isExpanded = expandedOrder === order.id
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-cream-200/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center">
                            <Coffee className="w-6 h-6 text-espresso-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-espresso-900">{order.cafe}</h3>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-espresso-500">
                              <span>#{order.orderNumber}</span>
                              <span>{order.createdAt}</span>
                              <span className="font-semibold text-espresso-700">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                          <ChevronDown className={cn(
                            "w-5 h-5 text-espresso-400 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-cream-200/50">
                              {/* Order Items */}
                              <div className="space-y-2 py-3">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-espresso-700">
                                      {item.quantity}x {item.name}
                                      {item.modifiers && (
                                        <span className="text-espresso-500 text-xs"> · {item.modifiers}</span>
                                      )}
                                    </span>
                                    <span className="text-espresso-800">{formatCurrency(item.price * item.quantity)}</span>
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
                                <Link href={`/order/${order.cafeSlug}`} className="flex-1">
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

