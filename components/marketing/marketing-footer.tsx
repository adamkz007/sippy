import Link from "next/link"
import { Coffee } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-border/50 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-0 sm:gap-x-10 lg:gap-20 w-full">
            <div>
              <h4 className="font-bold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="/#product" className="hover:text-foreground">
                    POS
                  </Link>
                </li>
                <li>
                  <Link href="/#product" className="hover:text-foreground">
                    Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/#product" className="hover:text-foreground">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/#product" className="hover:text-foreground">
                    Loyalty
                  </Link>
                </li>
              </ul>
            </div>
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
                <li>
                  <Link href="/resources#operations" className="hover:text-foreground">
                    Operations
                  </Link>
                </li>
                <li>
                  <Link href="/resources#playbooks" className="hover:text-foreground">
                    Playbooks
                  </Link>
                </li>
                <li>
                  <Link href="/resources#downloads" className="hover:text-foreground">
                    Downloads
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="/privacy-policy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground">
          <p>© 2025 Sippy Inc</p>
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

