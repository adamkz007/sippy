"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  Shield, 
  LayoutDashboard, 
  Store, 
  Users, 
  BarChart3, 
  Settings,
  DollarSign,
  Menu,
  X,
  LogOut,
  Coffee,
  TrendingUp,
  Database
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Cafes", href: "/admin/cafes", icon: Store },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Financials", href: "/admin/financials", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "System", href: "/admin/system", icon: Database },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if user is superadmin
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "SUPERADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">You don't have permission to access this area.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="border-slate-700">
          Go Home
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight block">Sippy Admin</span>
                <span className="text-xs text-slate-500 font-medium">Super Admin Panel</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Management</p>
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-amber-400" : "text-slate-500")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Back to Main App */}
          <div className="p-4 border-t border-slate-800/50">
            <Link href="/">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 mb-3" 
                size="sm"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Back to Sippy
              </Button>
            </Link>
          </div>

          {/* User menu */}
          <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-11 h-11 ring-2 ring-amber-500/30">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-white">{session?.user?.name || "Admin"}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-400 truncate">Super Admin</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start border-slate-700 bg-transparent text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30" 
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
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 mr-4 text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium">All systems operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
              ENV: {process.env.NODE_ENV || "development"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

