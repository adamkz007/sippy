"use client"

import { useState } from "react"
import { 
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  X,
  Check,
  Coffee,
  ChevronRight,
  Phone,
  Loader2,
  Star,
  Award,
  Smartphone,
  UserX
} from "lucide-react"
import { cn, formatCurrency, formatPoints, generateOrderNumber, getTierColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog"
import { useCurrency } from "@/components/currency-context"

// Mock menu data
const categories = [
  { id: "coffee", name: "Coffee", emoji: "☕" },
  { id: "specialty", name: "Specialty", emoji: "✨" },
  { id: "food", name: "Food", emoji: "🥐" },
  { id: "cold", name: "Cold Drinks", emoji: "🧊" },
  { id: "tea", name: "Tea", emoji: "🍵" },
]

const products = [
  // Coffee
  { id: "1", name: "Flat White", price: 5.50, category: "coffee", popular: true },
  { id: "2", name: "Long Black", price: 4.50, category: "coffee", popular: true },
  { id: "3", name: "Cappuccino", price: 5.50, category: "coffee" },
  { id: "4", name: "Latte", price: 5.50, category: "coffee" },
  { id: "5", name: "Espresso", price: 4.00, category: "coffee" },
  { id: "6", name: "Double Espresso", price: 5.00, category: "coffee" },
  { id: "7", name: "Mocha", price: 6.50, category: "coffee" },
  { id: "8", name: "Piccolo", price: 4.50, category: "coffee" },
  // Specialty
  { id: "9", name: "Oat Latte", price: 6.50, category: "specialty", popular: true },
  { id: "10", name: "Turmeric Latte", price: 6.50, category: "specialty" },
  { id: "11", name: "Matcha Latte", price: 7.00, category: "specialty" },
  { id: "12", name: "Chai Latte", price: 6.00, category: "specialty" },
  // Cold
  { id: "13", name: "Iced Latte", price: 6.00, category: "cold" },
  { id: "14", name: "Cold Brew", price: 5.50, category: "cold", popular: true },
  { id: "15", name: "Iced Long Black", price: 5.00, category: "cold" },
  { id: "16", name: "Iced Mocha", price: 7.00, category: "cold" },
  // Food
  { id: "17", name: "Avocado Toast", price: 16.00, category: "food" },
  { id: "18", name: "Croissant", price: 5.50, category: "food" },
  { id: "19", name: "Banana Bread", price: 6.50, category: "food" },
  { id: "20", name: "Muffin", price: 5.00, category: "food" },
  // Tea
  { id: "21", name: "English Breakfast", price: 4.50, category: "tea" },
  { id: "22", name: "Earl Grey", price: 4.50, category: "tea" },
  { id: "23", name: "Green Tea", price: 4.50, category: "tea" },
  { id: "24", name: "Peppermint", price: 4.50, category: "tea" },
]

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  modifiers?: string[]
}

interface CustomerInfo {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  tier: string
  pointsBalance: number
  lifetimePoints: number
  lifetimeSpend: number
  totalOrders: number
  profileType: string | null
}

interface GuestCustomer {
  phone: string
  isGuest: true
}

type OrderType = "TAKEAWAY" | "DINE_IN"
type AttachedCustomer = CustomerInfo | GuestCustomer | null

export default function POSPage() {
  const { currency } = useCurrency()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY")
  const [showPayment, setShowPayment] = useState(false)
  
  // Customer lookup state
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [phoneInput, setPhoneInput] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<{ found: boolean; customer?: CustomerInfo; phone?: string } | null>(null)
  const [attachedCustomer, setAttachedCustomer] = useState<AttachedCustomer>(null)

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id)
    
    if (existingItem) {
      setCart(cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter((item) => item.quantity > 0))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    setShowPayment(false)
    setAttachedCustomer(null)
  }

  // Customer lookup functions
  const handlePhoneLookup = async () => {
    if (!phoneInput.trim()) return
    
    setLookupLoading(true)
    setLookupResult(null)
    
    try {
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phoneInput)}`)
      const data = await res.json()
      
      if (res.ok) {
        setLookupResult(data)
      } else {
        setLookupResult({ found: false, phone: phoneInput })
      }
    } catch (error) {
      console.error("Lookup error:", error)
      setLookupResult({ found: false, phone: phoneInput })
    }
    
    setLookupLoading(false)
  }

  const handleAttachCustomer = () => {
    if (lookupResult?.found && lookupResult.customer) {
      setAttachedCustomer(lookupResult.customer)
    }
    setCustomerModalOpen(false)
    resetLookup()
  }

  const handleAttachGuest = () => {
    const phone = lookupResult?.phone || phoneInput
    if (phone) {
      setAttachedCustomer({ phone, isGuest: true })
    }
    setCustomerModalOpen(false)
    resetLookup()
  }

  const handleRemoveCustomer = () => {
    setAttachedCustomer(null)
  }

  const resetLookup = () => {
    setPhoneInput("")
    setLookupResult(null)
  }

  const openCustomerModal = () => {
    resetLookup()
    setCustomerModalOpen(true)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  // Calculate points that would be earned (1 point per dollar spent)
  const pointsToEarn = Math.floor(subtotal)

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="shrink-0"
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="pos-grid">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="relative p-4 rounded-xl border bg-white hover:border-espresso-300 hover:shadow-md transition-all text-left group"
              >
                {product.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-espresso-700">
                    Popular
                  </Badge>
                )}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-espresso-100 to-latte-100 flex items-center justify-center mb-3">
                  <Coffee className="w-5 h-5 text-espresso-600" />
                </div>
                <p className="font-medium text-sm mb-1 line-clamp-2">{product.name}</p>
                <p className="text-lg font-bold text-espresso-700">
                  {formatCurrency(product.price, currency)}
                </p>
                <div className="absolute inset-0 rounded-xl border-2 border-espresso-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col bg-white rounded-xl border shadow-sm">
        {!showPayment ? (
          <>
            {/* Order Type Toggle */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <Button
                  variant={orderType === "TAKEAWAY" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderType("TAKEAWAY")}
                >
                  Takeaway
                </Button>
                <Button
                  variant={orderType === "DINE_IN" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderType("DINE_IN")}
                >
                  Dine In
                </Button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm">Tap products to add them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price, currency)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <div className="border-t p-4 space-y-4">
              {/* Customer Card */}
              {attachedCustomer ? (
                <div className={cn(
                  "rounded-lg p-3 relative",
                  'isGuest' in attachedCustomer 
                    ? "bg-gray-50 border border-dashed" 
                    : "bg-gradient-to-br from-espresso-50 to-latte-50 border border-espresso-200"
                )}>
                  <button
                    onClick={handleRemoveCustomer}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/80 transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                  
                  {'isGuest' in attachedCustomer ? (
                    // Guest customer card
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">Guest Customer</p>
                          <Badge variant="secondary" className="text-[10px]">No App</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{attachedCustomer.phone}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          +{pointsToEarn} pts tracked for later claim
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Registered customer card
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-espresso-100 flex items-center justify-center">
                        {attachedCustomer.image ? (
                          <img src={attachedCustomer.image} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-espresso-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{attachedCustomer.name || 'Customer'}</p>
                          <Badge className={cn("text-[10px]", getTierColor(attachedCustomer.tier))}>
                            {attachedCustomer.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {formatPoints(attachedCustomer.pointsBalance)} pts
                          </span>
                          <span>{attachedCustomer.totalOrders} orders</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          +{pointsToEarn} pts on this order
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="outline" className="w-full justify-start" onClick={openCustomerModal}>
                  <User className="w-4 h-4 mr-2" />
                  Add Customer
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (10%)</span>
                  <span>{formatCurrency(tax, currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={cart.length === 0}
                  onClick={clearCart}
                >
                  Clear
                </Button>
                <Button 
                  className="flex-1"
                  disabled={cart.length === 0}
                  onClick={() => setShowPayment(true)}
                >
                  Pay {formatCurrency(total, currency)}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <PaymentPanel 
            total={total}
            customer={attachedCustomer}
            pointsToEarn={pointsToEarn}
            currency={currency}
            onBack={() => setShowPayment(false)}
            onComplete={clearCart}
          />
        )}
      </div>

      {/* Customer Lookup Modal */}
      <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
        <DialogContent onClose={() => setCustomerModalOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Enter customer phone number to look up their profile
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {/* Phone Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+60 12-345 6789"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneLookup()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handlePhoneLookup} disabled={lookupLoading || !phoneInput.trim()}>
                {lookupLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quick dial buttons */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', '⌫'].map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-12 text-lg"
                  onClick={() => {
                    if (key === '⌫') {
                      setPhoneInput(prev => prev.slice(0, -1))
                    } else {
                      setPhoneInput(prev => prev + key)
                    }
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>

            {/* Lookup Result */}
            {lookupResult && (
              <div className="animate-in fade-in-0 slide-in-from-top-2">
                {lookupResult.found && lookupResult.customer ? (
                  // Found customer
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-green-200">
                        {lookupResult.customer.image ? (
                          <img src={lookupResult.customer.image} alt="" className="w-12 h-12 rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{lookupResult.customer.name || 'Customer'}</p>
                          <Badge className={cn("text-xs", getTierColor(lookupResult.customer.tier))}>
                            {lookupResult.customer.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lookupResult.customer.phone}</p>
                      </div>
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="font-bold text-green-700">{formatPoints(lookupResult.customer.pointsBalance)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="font-bold">{lookupResult.customer.totalOrders}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Lifetime</p>
                        <p className="font-bold">{formatCurrency(lookupResult.customer.lifetimeSpend, currency)}</p>
                      </div>
                    </div>

                    {lookupResult.customer.profileType && (
                      <div className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-muted-foreground">Coffee Profile:</span>
                        <span className="font-medium">{lookupResult.customer.profileType}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Not found - guest customer
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-amber-200">
                        <UserX className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">New Customer</p>
                        <p className="text-sm text-muted-foreground">{lookupResult.phone || phoneInput}</p>
                      </div>
                      <Badge variant="secondary">No App</Badge>
                    </div>
                    
                    <div className="text-sm text-amber-700 bg-white rounded-lg p-3">
                      <p className="font-medium mb-1">Points will be tracked!</p>
                      <p className="text-xs text-muted-foreground">
                        When this customer downloads Sippy and registers with this phone number, 
                        they can claim all accumulated points.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerModalOpen(false)}>
              Cancel
            </Button>
            {lookupResult?.found ? (
              <Button onClick={handleAttachCustomer}>
                <Check className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            ) : lookupResult && (
              <Button onClick={handleAttachGuest} variant="secondary">
                <UserX className="w-4 h-4 mr-2" />
                Add as Guest
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PaymentPanel({ 
  total, 
  customer,
  pointsToEarn,
  currency,
  onBack, 
  onComplete 
}: { 
  total: number
  customer: AttachedCustomer
  pointsToEarn: number
  currency: string
  onBack: () => void
  onComplete: () => void
}) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const cashAmount = parseFloat(cashReceived) || 0
  const change = cashAmount - total

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
        <p className="text-muted-foreground mb-2">Order #{generateOrderNumber()}</p>
        {paymentMethod === "cash" && change > 0 && (
          <p className="text-lg font-medium text-green-600 mb-4">
            Change: {formatCurrency(change, currency)}
          </p>
        )}
        
        {/* Points earned */}
        {customer && pointsToEarn > 0 && (
          <div className="bg-gradient-to-br from-espresso-50 to-latte-50 rounded-lg px-4 py-3 mb-6 w-full">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-espresso-800">+{pointsToEarn} points</span>
              {'isGuest' in customer ? (
                <span className="text-sm text-muted-foreground">tracked</span>
              ) : (
                <span className="text-sm text-muted-foreground">earned</span>
              )}
            </div>
            {'isGuest' in customer && (
              <p className="text-xs text-muted-foreground mt-1">
                Linked to {customer.phone}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1">
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onComplete}>
            New Order
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Payment</h2>
      </div>

      {/* Total */}
      <div className="p-6 text-center border-b">
        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
        <p className="text-4xl font-bold">{formatCurrency(total, currency)}</p>
        {customer && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">
              {pointsToEarn} points will be {'isGuest' in customer ? 'tracked' : 'earned'}
            </span>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="flex-1 p-4 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Select Payment Method</p>
        
        <button
          onClick={() => setPaymentMethod("card")}
          className={cn(
            "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
            paymentMethod === "card" 
              ? "border-espresso-500 bg-espresso-50" 
              : "border-border hover:border-espresso-200"
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Card</p>
            <p className="text-sm text-muted-foreground">Tap, insert, or swipe</p>
          </div>
          {paymentMethod === "card" && (
            <Check className="w-5 h-5 text-espresso-600 ml-auto" />
          )}
        </button>

        <button
          onClick={() => setPaymentMethod("cash")}
          className={cn(
            "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
            paymentMethod === "cash" 
              ? "border-espresso-500 bg-espresso-50" 
              : "border-border hover:border-espresso-200"
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Cash</p>
            <p className="text-sm text-muted-foreground">Pay with notes or coins</p>
          </div>
          {paymentMethod === "cash" && (
            <Check className="w-5 h-5 text-espresso-600 ml-auto" />
          )}
        </button>

        {paymentMethod === "cash" && (
          <div className="space-y-3 animate-in">
            <p className="text-sm font-medium">Cash Received</p>
            <Input
              type="number"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="text-2xl font-bold h-14 text-center"
            />
            {change > 0 && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-center">
                <p className="text-sm">Change Due</p>
                <p className="text-xl font-bold">{formatCurrency(change, currency)}</p>
              </div>
            )}
            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setCashReceived(amount.toString())}
                >
                  {currency === 'MYR' ? 'RM' : '$'}{amount}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Button */}
      <div className="p-4 border-t">
        <Button
          className="w-full h-14 text-lg"
          disabled={!paymentMethod || isProcessing || (paymentMethod === "cash" && cashAmount < total)}
          onClick={handlePayment}
        >
          {isProcessing ? (
            "Processing..."
          ) : paymentMethod === "card" ? (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Tap Card to Pay
            </>
          ) : (
            "Complete Payment"
          )}
        </Button>
      </div>
    </div>
  )
}
