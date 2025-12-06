"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { 
  User, 
  Settings, 
  ChevronRight,
  Heart,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  Package,
  Sparkles,
  Loader2,
} from "lucide-react"
import { cn, formatPoints, getTierColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CustomerProfile {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
  }
  loyalty: {
    tier: string
    pointsBalance: number
    lifetimePoints: number
    lifetimeSpend: number
  }
  coffeeProfile: any
  vouchers: any[]
  stats: {
    totalOrders: number
    favoriteCafes: number
  }
  memberSince: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "loading") return
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/customer/me")
        if (!res.ok) throw new Error("Failed to fetch profile")
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError("Failed to load profile")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status])

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-espresso-900">Sign in to view your profile</h2>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  const user = profile?.user || {
    name: session.user?.name || "User",
    email: session.user?.email || "",
    phone: null,
    image: session.user?.image || null,
  }

  const loyalty = profile?.loyalty || {
    tier: "BRONZE",
    pointsBalance: 0,
    lifetimePoints: 0,
    lifetimeSpend: 0,
  }

  const stats = profile?.stats || {
    totalOrders: 0,
    favoriteCafes: 0,
  }

  const memberSince = profile?.memberSince 
    ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently"

  const menuItems = [
    {
      id: "coffee-profile",
      label: "My Coffee Profile",
      description: profile?.coffeeProfile ? "Your AI-powered taste profile" : "Start your taste journey",
      icon: Sparkles,
      href: "/profile/coffee",
      badge: profile?.coffeeProfile ? null : "New",
      color: "text-violet-600 bg-violet-100",
    },
    {
      id: "orders",
      label: "Order History",
      description: `${stats.totalOrders} orders`,
      icon: Package,
      href: "/profile/orders",
    },
    {
      id: "favorites",
      label: "Favorite Cafes",
      description: `${stats.favoriteCafes} saved`,
      icon: Heart,
      href: "/profile/favorites",
    },
    {
      id: "payment",
      label: "Payment Methods",
      description: "Manage cards & wallets",
      icon: CreditCard,
      href: "/profile/payment",
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts & preferences",
      icon: Bell,
      href: "/profile/notifications",
    },
    {
      id: "settings",
      label: "Account Settings",
      description: "Profile & preferences",
      icon: Settings,
      href: "/profile/settings",
    },
  ]

  const supportItems = [
    {
      id: "help",
      label: "Help Center",
      icon: HelpCircle,
      href: "/help",
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: Shield,
      href: "/privacy",
    },
  ]

  return (
    <div className="min-h-screen pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-espresso-900 font-display">Profile</h1>
          <Link href="/profile/settings" prefetch={true}>
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-5 h-5 text-espresso-600" />
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="border-cream-200/50 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* User Info */}
            <div className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-cream-200">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-espresso-100 to-espresso-200 text-espresso-700 text-xl font-semibold">
                    {(user.name || "U").split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-espresso-900">{user.name || "User"}</h2>
                    <Badge className={getTierColor(loyalty.tier)}>
                      {loyalty.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-espresso-600">{user.email}</p>
                  <p className="text-xs text-espresso-500 mt-1">
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-cream-200">
              <Link href="/loyalty" className="p-4 text-center hover:bg-cream-50 transition-colors" prefetch={true}>
                <div className="flex items-center justify-center gap-1 text-espresso-800 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {formatPoints(loyalty.pointsBalance)}
                </div>
                <p className="text-xs text-espresso-500 mt-1">Points</p>
              </Link>
              <Link href="/profile/orders" className="p-4 text-center hover:bg-cream-50 transition-colors" prefetch={true}>
                <div className="text-espresso-800 font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-espresso-500 mt-1">Orders</p>
              </Link>
              <Link href="/profile/favorites" className="p-4 text-center hover:bg-cream-50 transition-colors" prefetch={true}>
                <div className="flex items-center justify-center gap-1 text-espresso-800 font-bold">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  {stats.favoriteCafes}
                </div>
                <p className="text-xs text-espresso-500 mt-1">Favorites</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Menu Items */}
      <div className="px-4 space-y-4">
        <Card className="border-cream-200/50 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {menuItems.map((menuItem, index) => (
              <Link key={menuItem.id} href={menuItem.href} prefetch={true}>
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors hover:bg-cream-100/50 active:bg-cream-100",
                    index !== menuItems.length - 1 && "border-b border-cream-200/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    menuItem.color || "bg-cream-100 text-espresso-600"
                  )}>
                    <menuItem.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-espresso-900">{menuItem.label}</h3>
                      {menuItem.badge && (
                        <Badge className="bg-violet-100 text-violet-700 text-[10px]">
                          {menuItem.badge}
                        </Badge>
                      )}
                    </div>
                    {menuItem.description && (
                      <p className="text-xs text-espresso-500">{menuItem.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-espresso-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Support */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-2 px-1">Support</h3>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {supportItems.map((supportItem, index) => (
                <Link key={supportItem.id} href={supportItem.href} prefetch={true}>
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors hover:bg-cream-100/50 active:bg-cream-100",
                      index !== supportItems.length - 1 && "border-b border-cream-200/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-espresso-600">
                      <supportItem.icon className="w-5 h-5" />
                    </div>
                    <h3 className="flex-1 font-medium text-espresso-900">{supportItem.label}</h3>
                    <ChevronRight className="w-5 h-5 text-espresso-400" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-espresso-400 pt-2">
          Sippy v1.0.0
        </p>
      </div>
    </div>
  )
}
