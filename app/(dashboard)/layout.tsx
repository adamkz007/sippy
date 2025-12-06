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
  ChevronLeft,
  ChevronRight,
  Store
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CurrencyProvider } from "@/components/currency-context"
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        "fixed inset-y-0 left-0 z-50 bg-espresso-950 border-r border-espresso-800 transform transition-all duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-20" : "lg:w-64",
        "w-64" // Always full width on mobile
      )}>
        {/* Expand stub - visible only when collapsed on desktop */}
        <button
          onClick={() => setSidebarCollapsed(false)}
          className={cn(
            "hidden absolute top-7 -right-3 z-10 w-6 h-6 rounded-full bg-espresso-800 border border-espresso-700 items-center justify-center text-espresso-400 hover:text-white hover:bg-espresso-700 transition-all shadow-md",
            sidebarCollapsed ? "lg:flex" : "lg:hidden"
          )}
          title="Expand sidebar"
        >
          <ChevronRight className="w-3 h-3" />
        </button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center h-20 mb-2 transition-all duration-300",
            sidebarCollapsed ? "lg:px-5 lg:justify-center" : "px-6 justify-between"
          )}>
            <Link href="/dashboard" className={cn(
              "flex items-center gap-3 group",
              sidebarCollapsed ? "lg:gap-0" : ""
            )}>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10 transition-transform group-hover:rotate-12 shrink-0">
                <Coffee className="w-5 h-5 text-carbon" strokeWidth={2.5} />
              </div>
              <span className={cn(
                "text-2xl font-bold text-white font-display tracking-tight transition-all duration-300",
                sidebarCollapsed ? "lg:hidden lg:w-0 lg:opacity-0" : "lg:opacity-100"
              )}>Sippy</span>
            </Link>
            {/* Collapse button - desktop only, visible when expanded */}
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className={cn(
                "hidden p-2 rounded-lg hover:bg-espresso-800 text-espresso-400 hover:text-white transition-colors",
                sidebarCollapsed ? "lg:hidden" : "lg:flex"
              )}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {/* Close button - mobile only */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-espresso-800 text-espresso-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cafe selector */}
          {currentCafe && (
            <div className={cn(
              "border-b border-espresso-800 transition-all duration-300",
              sidebarCollapsed ? "lg:p-2" : "p-4"
            )}>
              <button className={cn(
                "w-full flex items-center gap-3 rounded-xl bg-espresso-900/50 border border-espresso-800 hover:bg-espresso-800 hover:border-espresso-700 transition-all group",
                sidebarCollapsed ? "lg:p-2 lg:justify-center" : "p-3"
              )}>
                <div className="w-10 h-10 rounded-lg bg-espresso-800 flex items-center justify-center group-hover:bg-espresso-700 transition-colors shrink-0">
                  <Store className="w-5 h-5 text-espresso-400 group-hover:text-white" />
                </div>
                <div className={cn(
                  "flex-1 text-left transition-all duration-300",
                  sidebarCollapsed ? "lg:hidden" : ""
                )}>
                  <p className="font-medium text-sm text-espresso-100">{currentCafe.name}</p>
                  <p className="text-xs text-espresso-400">Active</p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-espresso-500 transition-all duration-300",
                  sidebarCollapsed ? "lg:hidden" : ""
                )} />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 overflow-y-auto transition-all duration-300",
            sidebarCollapsed ? "lg:p-2" : "p-4"
          )}>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-200",
                    sidebarCollapsed ? "lg:px-0 lg:justify-center lg:rounded-xl" : "px-3 rounded-full",
                    isActive 
                      ? "bg-cream-200 text-espresso-900 shadow-lg shadow-cream-200/20 font-bold" 
                      : "text-stone-400 hover:bg-stone-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-carbon" : "text-stone-500 group-hover:text-white")} />
                  <span className={cn(
                    "transition-all duration-300",
                    sidebarCollapsed ? "lg:hidden" : ""
                  )}>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className={cn(
            "border-t border-espresso-800 transition-all duration-300",
            sidebarCollapsed ? "lg:p-2" : "p-4"
          )}>
            <div className={cn(
              "flex items-center gap-3 mb-4",
              sidebarCollapsed ? "lg:justify-center lg:mb-2" : ""
            )}>
              <Avatar className="w-10 h-10 ring-2 ring-espresso-800 shrink-0">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-espresso-800 text-espresso-200">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                sidebarCollapsed ? "lg:hidden" : ""
              )}>
                <p className="font-medium text-sm truncate text-espresso-100">{session?.user?.name || "User"}</p>
                <p className="text-xs text-espresso-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className={cn(
                "w-full border-espresso-800 bg-transparent text-espresso-400 hover:bg-espresso-800 hover:text-white hover:border-espresso-700 transition-all duration-300",
                sidebarCollapsed ? "lg:p-2 lg:justify-center" : "justify-start"
              )}
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              title={sidebarCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className={cn("w-4 h-4", sidebarCollapsed ? "" : "mr-2")} />
              <span className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "lg:hidden" : ""
              )}>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Mobile menu button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-md hover:bg-muted"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page content */}
        <main className="p-4 lg:p-6 pt-16 lg:pt-6">
          <CurrencyProvider defaultCurrency="MYR">
            {children}
          </CurrencyProvider>
        </main>
      </div>
    </div>
  )
}

