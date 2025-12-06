"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  Coffee, 
  Clock, 
  MapPin, 
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  Gift,
  X
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Mock cafe data
const mockCafe = {
  name: "The Daily Grind",
  slug: "daily-grind",
  image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  rating: 4.8,
  reviews: 234,
  address: "123 Coffee Street, Melbourne",
  distance: "0.3 km",
  openNow: true,
  closesAt: "5:00 PM",
  prepTime: "5-10 min",
}

const mockCategories = [
  { id: "coffee", name: "Coffee" },
  { id: "specialty", name: "Specialty" },
  { id: "cold", name: "Cold Drinks" },
  { id: "food", name: "Food" },
]

const mockProducts = [
  { id: "1", name: "Flat White", description: "Double shot with silky milk", price: 5.50, category: "coffee", image: null, popular: true },
  { id: "2", name: "Long Black", description: "Double shot over hot water", price: 4.50, category: "coffee", image: null, popular: true },
  { id: "3", name: "Cappuccino", description: "Espresso with foamed milk", price: 5.50, category: "coffee", image: null },
  { id: "4", name: "Latte", description: "Espresso with steamed milk", price: 5.50, category: "coffee", image: null },
  { id: "5", name: "Oat Latte", description: "Oat milk, double shot", price: 6.50, category: "specialty", image: null, popular: true },
  { id: "6", name: "Matcha Latte", description: "Japanese ceremonial grade", price: 7.00, category: "specialty", image: null },
  { id: "7", name: "Cold Brew", description: "24hr slow steeped", price: 5.50, category: "cold", image: null, popular: true },
  { id: "8", name: "Iced Latte", description: "Espresso over ice with milk", price: 6.00, category: "cold", image: null },
  { id: "9", name: "Avocado Toast", description: "Sourdough, feta, chili", price: 16.00, category: "food", image: null },
  { id: "10", name: "Banana Bread", description: "House-made, warm", price: 6.50, category: "food", image: null },
]

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

export default function OnlineOrderPage() {
  const params = useParams()
  const [activeCategory, setActiveCategory] = useState("coffee")
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  const filteredProducts = mockProducts.filter(p => p.category === activeCategory)
  
  const addToCart = (product: typeof mockProducts[0]) => {
    const existing = cart.find(item => item.productId === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">{mockCafe.name}</h1>
            <p className="text-xs text-muted-foreground">{mockCafe.prepTime} pickup</p>
          </div>
          {cartCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {formatCurrency(cartTotal)}
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-espresso-500 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            </Button>
          )}
        </div>
      </header>

      {/* Cafe Hero */}
      <div className="relative h-48 bg-gradient-to-br from-espresso-100 to-latte-100">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="container mx-auto flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display">{mockCafe.name}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {mockCafe.rating} ({mockCafe.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockCafe.distance}
                </span>
              </div>
            </div>
            <Badge variant={mockCafe.openNow ? "success" : "secondary"}>
              {mockCafe.openNow ? `Open · Closes ${mockCafe.closesAt}` : "Closed"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Loyalty Banner */}
      <div className="bg-gradient-to-r from-espresso-700 to-espresso-900 text-cream-100 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Earn 1 point per $1 · Redeem at any Sippy cafe!</span>
          </div>
          <Link href="/login" className="text-sm underline">Sign in</Link>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-14 z-40 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4">
            {mockCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="shrink-0"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.popular && (
                        <Badge variant="secondary" className="text-[10px] mt-1">Popular</Badge>
                      )}
                    </div>
                    <p className="font-bold text-espresso-700">{formatCurrency(product.price)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                </div>
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-espresso-100 to-latte-100 flex items-center justify-center shrink-0">
                  <Coffee className="w-8 h-8 text-espresso-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Your Order</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mb-4" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-sm">Add some items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-espresso-100 flex items-center justify-center">
                        <Coffee className="w-6 h-6 text-espresso-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (10%)</span>
                    <span>{formatCurrency(cartTotal * 0.1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal * 1.1)}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Checkout · {formatCurrency(cartTotal * 1.1)}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Button 
            className="w-full h-14 text-lg shadow-lg"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            View Cart · {formatCurrency(cartTotal * 1.1)}
            <Badge className="ml-2 bg-white text-espresso-700">{cartCount}</Badge>
          </Button>
        </div>
      )}
    </div>
  )
}

