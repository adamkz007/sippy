"use client"

import { useEffect, useCallback, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Camera,
  Phone,
  QrCode,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Coffee,
  ArrowUpRight,
  Clock,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useCurrency } from "@/components/currency-context"

interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  avgTicket: number
  activeCustomers: number
  revenueChange: number
  ordersChange: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  items: number
  total: number
  status: string
  createdAt: string
}

interface TopProduct {
  name: string
  orders: number
  revenue: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    avgTicket: 0,
    activeCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const [scanOpen, setScanOpen] = useState(false)
  const [scanTab, setScanTab] = useState<"qr" | "phone">("qr")
  const [phoneInput, setPhoneInput] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<{ found: boolean; customerId?: string; name?: string | null; phone?: string } | null>(null)
  const [recording, setRecording] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [qrSupported, setQrSupported] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    if (!cafeId) return
    
    try {
      const res = await fetch(`/api/dashboard/stats?cafeId=${cafeId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
        setTopProducts(data.topProducts)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
    setLoading(false)
  }, [cafeId])

  const stopQr = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const normalizePhone = useCallback((phone: string) => {
    return phone.replace(/[\s\-\(\)]/g, '')
  }, [])

  const recordMember = useCallback(async (payload: { customerId?: string; phone?: string }) => {
    if (!cafeId) return
    setRecording(true)
    try {
      const res = await fetch('/api/dashboard/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId, ...payload }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to record member')
      }

      setScanOpen(false)
      setPhoneInput("")
      setLookupResult(null)
      toast({
        title: "Member recorded",
        description: "They’ll now appear in Customers.",
      })
    } catch (e: any) {
      toast({
        title: "Could not record member",
        description: e?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setRecording(false)
    }
  }, [cafeId, toast])

  const parseQrValue = useCallback((raw: string): { customerId?: string; phone?: string } | null => {
    const trimmed = raw.trim()
    if (!trimmed) return null
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const obj = JSON.parse(trimmed)
        if (obj?.customerId && typeof obj.customerId === "string") return { customerId: obj.customerId }
        if (obj?.phone && typeof obj.phone === "string") return { phone: normalizePhone(obj.phone) }
      } catch {}
    }

    const phone = normalizePhone(trimmed)
    const phoneLike = /^(\+?\d{7,15})$/.test(phone)
    if (phoneLike) return { phone }
    return { customerId: trimmed }
  }, [normalizePhone])

  const canUseQr = useMemo(() => {
    return typeof window !== "undefined" && "BarcodeDetector" in window && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  }, [])

  const startQr = useCallback(async () => {
    setQrError(null)
    stopQr()

    if (!canUseQr) {
      setQrSupported(false)
      setQrError("QR scanning isn’t supported in this browser.")
      return
    }

    setQrSupported(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      streamRef.current = stream
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const BarcodeDetectorCtor = (window as any).BarcodeDetector
      const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] })

      const tick = async () => {
        if (!videoRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          const value = barcodes?.[0]?.rawValue
          if (value) {
            const parsed = parseQrValue(value)
            if (parsed) {
              stopQr()
              await recordMember(parsed)
              return
            }
          }
        } catch (e: any) {
          setQrError(e?.message || "Failed to scan QR.")
        }
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    } catch (e: any) {
      setQrError(e?.message || "Camera permission denied or unavailable.")
    }
  }, [canUseQr, parseQrValue, recordMember, stopQr])

  const lookupByPhone = useCallback(async () => {
    const normalized = normalizePhone(phoneInput)
    if (!normalized) return
    setLookupLoading(true)
    setLookupResult(null)
    try {
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(normalized)}`)
      const data = await res.json().catch(() => null)
      if (res.ok && data?.found && data?.customer?.id) {
        setLookupResult({
          found: true,
          customerId: data.customer.id,
          name: data.customer.name,
          phone: data.customer.phone,
        })
      } else {
        setLookupResult({ found: false, phone: data?.phone || normalized })
      }
    } catch (e) {
      setLookupResult({ found: false, phone: normalized })
    } finally {
      setLookupLoading(false)
    }
  }, [normalizePhone, phoneInput])

  const handleOpenScan = useCallback(() => {
    setScanOpen(true)
    setScanTab(canUseQr ? "qr" : "phone")
    setPhoneInput("")
    setLookupResult(null)
    setQrError(null)
  }, [canUseQr])

  useEffect(() => {
    if (status === "loading") return
    
    if (cafeId) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [cafeId, status, fetchDashboardData])

  useEffect(() => {
    if (!scanOpen) {
      stopQr()
      return
    }
    if (scanTab === "qr") {
      startQr()
    } else {
      stopQr()
    }
  }, [scanOpen, scanTab, startQr, stopQr])

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 min ago"
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1 hour ago"
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  if (loading || status === "loading") {
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
              You need to be associated with a cafe to view the dashboard.
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
          <h1 className="text-2xl font-bold text-espresso-950 font-display">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s how your cafe is doing today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenScan} className="h-11 px-5">
            <QrCode className="w-4 h-4 mr-2" />
            Scan member
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/pos">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Open POS
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent onClose={() => setScanOpen(false)} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan member</DialogTitle>
            <DialogDescription>Scan a QR code or enter a phone number.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <Tabs value={scanTab} onValueChange={(v) => setScanTab(v as any)}>
              <TabsList className="w-full">
                {canUseQr ? (
                  <TabsTrigger value="qr" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    QR scan
                  </TabsTrigger>
                ) : (
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground opacity-50 flex-1 cursor-not-allowed">
                    <Camera className="w-4 h-4 mr-2" />
                    QR scan
                  </div>
                )}
                <TabsTrigger value="phone" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-3">
                <div className="rounded-lg border overflow-hidden bg-black/5">
                  <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
                </div>
                {!qrSupported && (
                  <p className="text-sm text-muted-foreground">
                    QR scanning needs camera + browser support. Use Phone if unavailable.
                  </p>
                )}
                {qrError && (
                  <p className="text-sm text-red-600">{qrError}</p>
                )}
                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={startQr} disabled={recording}>
                    Retry camera
                  </Button>
                  <p className="text-xs text-muted-foreground">Point the camera at the QR code.</p>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    inputMode="tel"
                    placeholder="Enter phone number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") lookupByPhone()
                    }}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {["1","2","3","4","5","6","7","8","9","+","0","←"].map((key) => (
                      <Button
                        key={key}
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => {
                          if (key === "←") {
                            setPhoneInput((v) => v.slice(0, -1))
                            return
                          }
                          setPhoneInput((v) => `${v}${key}`)
                        }}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                  <Button type="button" onClick={lookupByPhone} disabled={!phoneInput || lookupLoading}>
                    {lookupLoading ? "Looking up..." : "Lookup"}
                  </Button>
                </div>

                {lookupResult && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {lookupResult.found ? (
                          <>
                            <p className="font-medium">{lookupResult.name || "Customer"}</p>
                            <p className="text-sm text-muted-foreground">{lookupResult.phone}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Unregistered</p>
                            <p className="text-sm text-muted-foreground">{lookupResult.phone}</p>
                          </>
                        )}
                      </div>
                      <Badge variant={lookupResult.found ? "success" : "secondary"} className="text-[10px]">
                        {lookupResult.found ? "Found" : "New"}
                      </Badge>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)} disabled={recording}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (!lookupResult) return
                if (lookupResult.found && lookupResult.customerId) {
                  recordMember({ customerId: lookupResult.customerId })
                  return
                }
                if (lookupResult.phone) {
                  recordMember({ phone: lookupResult.phone })
                }
              }}
              disabled={recording || scanTab !== "phone" || !lookupResult}
            >
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          change={stats.revenueChange}
          icon={DollarSign}
        />
        <StatsCard
          title="Orders"
          value={stats.todayOrders.toString()}
          change={stats.ordersChange}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Avg. Ticket"
          value={formatCurrency(stats.avgTicket)}
          icon={Coffee}
        />
        <StatsCard
          title="Active Customers"
          value={stats.activeCustomers.toString()}
          icon={Users}
          subtitle="Unique today"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your cafe</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="w-8 h-8 mx-auto mb-2" />
                <p>No orders yet today</p>
              </div>
            ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                          Order #{order.orderNumber}
                        <span className="text-muted-foreground font-normal"> · {order.customer}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                          {formatTimeAgo(order.createdAt)}
                        <span>·</span>
                        {order.items} item{order.items > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best sellers today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/analytics">
                View Report
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
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
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-espresso-100 flex items-center justify-center text-sm font-semibold text-espresso-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.orders} orders</p>
                    </div>
                  </div>
                  <p className="font-medium">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction 
              href="/pos" 
              icon={ShoppingBag} 
              title="New Order" 
              description="Start a new transaction"
            />
            <QuickAction 
              href="/menu" 
              icon={Coffee} 
              title="Edit Menu" 
              description="Update products & prices"
            />
            <QuickAction 
              href="/customers" 
              icon={Users} 
              title="Customers" 
              description="View loyalty members"
            />
            <QuickAction 
              href="/analytics" 
              icon={TrendingUp} 
              title="Reports" 
              description="View detailed analytics"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  subtitle 
}: { 
  title: string
  value: string
  change?: number
  icon: React.ElementType
  subtitle?: string
}) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
              <span>{isPositive ? "+" : ""}{change}% from yesterday</span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "secondary" | "default"> = {
    COMPLETED: "success",
    READY: "default",
    PREPARING: "warning",
    PENDING: "secondary",
  }
  
  return (
    <Badge variant={variants[status] || "secondary"} className="text-[10px]">
      {status}
    </Badge>
  )
}

function QuickAction({ 
  href, 
  icon: Icon, 
  title, 
  description 
}: { 
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg bg-espresso-100 flex items-center justify-center group-hover:bg-espresso-200 transition-colors">
        <Icon className="w-6 h-6 text-espresso-600" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
