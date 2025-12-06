import Link from "next/link"
import { Coffee } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-border/50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Coffee className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight font-display">Sippy</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              The all-in-one operating system for modern cafe businesses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-10 gap-x-8 md:gap-x-16 lg:gap-x-20">
            <div>
              <h4 className="font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about#contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Resources</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-border/50 text-sm text-muted-foreground">
          <p>© 2025 Sippy by <a href="https://github.com/adamkz007" target="_blank" rel="noopener noreferrer">@adamkz007</a></p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

