"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  Coffee, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings,
  Gift,
  UtensilsCrossed,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Store
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingBag },
  { name: "Orders", href: "/orders", icon: UtensilsCrossed },
  { name: "Menu", href: "/menu", icon: Coffee },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Loyalty", href: "/dashboard/loyalty", icon: Gift },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentCafe = session?.user?.staffProfiles?.[0]?.cafe

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-espresso-950 border-r border-espresso-800 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 mb-2">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10 transition-transform group-hover:rotate-12">
                <Coffee className="w-5 h-5 text-carbon" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-white font-display tracking-tight">Sippy</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-espresso-800 text-espresso-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cafe selector */}
          {currentCafe && (
            <div className="p-4 border-b border-espresso-800">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-espresso-900/50 border border-espresso-800 hover:bg-espresso-800 hover:border-espresso-700 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-espresso-800 flex items-center justify-center group-hover:bg-espresso-700 transition-colors">
                  <Store className="w-5 h-5 text-espresso-400 group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-espresso-100">{currentCafe.name}</p>
                  <p className="text-xs text-espresso-400">Active</p>
                </div>
                <ChevronDown className="w-4 h-4 text-espresso-500" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-cream-200 text-espresso-900 shadow-lg shadow-cream-200/20 font-bold" 
                      : "text-stone-400 hover:bg-stone-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-carbon" : "text-stone-500 group-hover:text-white")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-espresso-800">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 ring-2 ring-espresso-800">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-espresso-800 text-espresso-200">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-espresso-100">{session?.user?.name || "User"}</p>
                <p className="text-xs text-espresso-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start border-espresso-800 bg-transparent text-espresso-400 hover:bg-espresso-800 hover:text-white hover:border-espresso-700" 
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b flex items-center px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted mr-4"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          {/* Quick actions could go here */}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

