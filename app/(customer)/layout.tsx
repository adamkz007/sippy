"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  Coffee, 
  Gift, 
  User,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/explore", icon: Coffee, label: "Order" },
  { href: "/loyalty", icon: Gift, label: "Rewards" },
  { href: "/profile", icon: User, label: "Profile" },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Check if we're on a page that should hide bottom nav (e.g., checkout, order detail)
  const hideNav = pathname.includes("/checkout") || pathname.includes("/order/")

  return (
    <div className="min-h-screen bg-cream-50 max-w-md mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-md mx-auto">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-cream-200/40 to-latte-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-48 h-48 bg-gradient-to-br from-espresso-100/30 to-cream-200/30 rounded-full blur-2xl" />
      </div>

      {/* Main content */}
      <main className={cn(
        "relative z-10 min-h-screen",
        !hideNav && "pb-24" // Add padding for bottom nav
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border-t border-cream-200/50 shadow-lg shadow-espresso-900/5">
            {/* Safe area for iOS */}
            <div className="flex items-center justify-around px-2 pt-2 pb-safe">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/home" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300",
                      isActive 
                        ? "text-espresso-900" 
                        : "text-espresso-400 hover:text-espresso-600"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-cream-200/60 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <item.icon 
                      className={cn(
                        "relative z-10 w-6 h-6 transition-transform duration-200",
                        isActive && "scale-110"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={cn(
                      "relative z-10 text-[10px] font-medium tracking-wide",
                      isActive && "font-semibold"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
