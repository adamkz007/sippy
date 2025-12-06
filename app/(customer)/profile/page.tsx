"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  User, 
  Settings, 
  ChevronRight,
  Coffee,
  Heart,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  Star,
  Package,
  Sparkles,
  MapPin
} from "lucide-react"
import { cn, formatPoints, getTierColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock user data
const user = {
  name: "Alex Chen",
  email: "alex@example.com",
  phone: "+61 412 345 678",
  image: null,
  memberSince: "March 2024",
  tier: "GOLD",
  points: 1250,
  totalOrders: 47,
  favoriteCafes: 3,
  hasCoffeeProfile: true,
}

const menuItems = [
  {
    id: "coffee-profile",
    label: "My Coffee Profile",
    description: "Your AI-powered taste profile",
    icon: Sparkles,
    href: "/profile/coffee",
    badge: "New",
    color: "text-violet-600 bg-violet-100",
  },
  {
    id: "orders",
    label: "Order History",
    description: `${user.totalOrders} orders`,
    icon: Package,
    href: "/profile/orders",
  },
  {
    id: "favorites",
    label: "Favorite Cafes",
    description: `${user.favoriteCafes} saved`,
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function ProfilePage() {
  return (
    <motion.div 
      className="min-h-screen pb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-espresso-900 font-display">Profile</h1>
          <Link href="/profile/settings">
            <Button variant="ghost" size="icon-sm">
              <Settings className="w-5 h-5 text-espresso-600" />
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <motion.div variants={item}>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {/* User Info */}
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-cream-200">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-espresso-100 to-espresso-200 text-espresso-700 text-xl font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-espresso-900">{user.name}</h2>
                      <Badge className={getTierColor(user.tier)}>
                        {user.tier}
                      </Badge>
                    </div>
                    <p className="text-sm text-espresso-600">{user.email}</p>
                    <p className="text-xs text-espresso-500 mt-1">
                      Member since {user.memberSince}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="grid grid-cols-3 divide-x divide-cream-200">
                <Link href="/loyalty" className="p-4 text-center hover:bg-cream-50 transition-colors">
                  <div className="flex items-center justify-center gap-1 text-espresso-800 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {formatPoints(user.points)}
                  </div>
                  <p className="text-xs text-espresso-500 mt-1">Points</p>
                </Link>
                <Link href="/profile/orders" className="p-4 text-center hover:bg-cream-50 transition-colors">
                  <div className="text-espresso-800 font-bold">{user.totalOrders}</div>
                  <p className="text-xs text-espresso-500 mt-1">Orders</p>
                </Link>
                <Link href="/profile/favorites" className="p-4 text-center hover:bg-cream-50 transition-colors">
                  <div className="flex items-center justify-center gap-1 text-espresso-800 font-bold">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    {user.favoriteCafes}
                  </div>
                  <p className="text-xs text-espresso-500 mt-1">Favorites</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </header>

      {/* Menu Items */}
      <div className="px-4 space-y-4">
        <motion.div variants={item}>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {menuItems.map((menuItem, index) => (
                <Link key={menuItem.id} href={menuItem.href}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(253, 224, 182, 0.3)" }}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
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
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Support */}
        <motion.div variants={item}>
          <h3 className="text-sm font-semibold text-espresso-700 mb-2 px-1">Support</h3>
          <Card className="border-cream-200/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {supportItems.map((supportItem, index) => (
                <Link key={supportItem.id} href={supportItem.href}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(253, 224, 182, 0.3)" }}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
                      index !== supportItems.length - 1 && "border-b border-cream-200/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-espresso-600">
                      <supportItem.icon className="w-5 h-5" />
                    </div>
                    <h3 className="flex-1 font-medium text-espresso-900">{supportItem.label}</h3>
                    <ChevronRight className="w-5 h-5 text-espresso-400" />
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div variants={item}>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </motion.div>

        {/* App Version */}
        <motion.p variants={item} className="text-center text-xs text-espresso-400 pt-2">
          Sippy v1.0.0
        </motion.p>
      </div>
    </motion.div>
  )
}

