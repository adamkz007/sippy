"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Home, 
  Coffee, 
  Gift, 
  User,
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

  // Check if we're on a page that should hide bottom nav (e.g., checkout)
  const hideNav = pathname.includes("/checkout")

  return (
    <div className="min-h-screen bg-cream-50 max-w-md mx-auto relative">
      {/* Background decoration - using CSS instead of fixed elements for better performance */}
      <div 
        className="fixed inset-0 pointer-events-none max-w-md mx-auto"
        style={{
          background: `
            radial-gradient(ellipse 300px 300px at calc(100% + 96px) -96px, rgba(253, 224, 182, 0.4), transparent),
            radial-gradient(ellipse 200px 200px at -128px 33%, rgba(249, 235, 225, 0.3), transparent)
          `
        }}
      />

      {/* Main content - no AnimatePresence wrapper for reliable navigation */}
      <main className={cn(
        "relative z-10 min-h-screen",
        !hideNav && "pb-24" // Add padding for bottom nav
      )}>
        {children}
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
                    prefetch={true}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors duration-200",
                      isActive 
                        ? "text-espresso-900" 
                        : "text-espresso-400 active:text-espresso-600"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-cream-200/60 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <item.icon 
                      className={cn(
                        "relative z-10 w-6 h-6",
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
