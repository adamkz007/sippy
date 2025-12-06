import Link from "next/link"
import { Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
]

export function MarketingHeader() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <header className="w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-border/50 rounded-full shadow-xl shadow-primary/5 pl-6 pr-2 py-2 flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
            <Coffee className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight font-display">Sippy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 ml-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            asChild
            className="hidden sm:inline-flex hover:bg-muted text-muted-foreground hover:text-foreground rounded-full px-5"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 h-10 shadow-lg shadow-secondary/20 transition-transform hover:scale-105 active:scale-95 font-bold"
          >
            <Link href="/register">Book a Demo</Link>
          </Button>
        </div>
      </header>
    </div>
  )
}

