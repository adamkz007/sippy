import Link from "next/link"
import { Coffee, Store, TrendingUp, Users, Gift, Sparkles, ArrowRight, CheckCircle, BarChart2, Smartphone, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      {/* Floating Navbar (Nory style) */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-border/50 rounded-full shadow-xl shadow-primary/5 pl-6 pr-2 py-2 flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
              <Coffee className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight font-display">Sippy</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 ml-8">
            {["Product", "Solutions", "Pricing", "Resources"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" asChild className="hidden sm:inline-flex hover:bg-muted text-muted-foreground hover:text-foreground rounded-full px-5">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 h-10 shadow-lg shadow-secondary/20 transition-transform hover:scale-105 active:scale-95 font-bold">
              <Link href="/register">Book a Demo</Link>
            </Button>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="pt-48 pb-24 md:pt-60 md:pb-32 px-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">The AI Operating System for Hospitality</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-foreground font-display leading-[0.9] mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Stress-free systems <br/>
            <span className="text-muted-foreground">for your cafe.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Centralize your POS, inventory, and workforce management. 
            Real-time insights that actually improve your bottom line.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button size="xl" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-16 px-10 text-lg shadow-xl shadow-primary/20 rounded-full transition-all hover:-translate-y-1">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="h-16 px-10 text-lg rounded-full border-2 border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:-translate-y-1">
              <Link href="/demo">
                View Live Demo
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-border/60 animate-in fade-in duration-1000 delay-500">
            <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY FORWARD-THINKING CAFES</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Brand Logos (Placeholders styled as text for now) */}
               {['Roast & Co.', 'Daily Grind', 'Bean Scene', 'Urban Brew', 'The Nook'].map((brand) => (
                 <span key={brand} className="text-xl font-bold font-display text-foreground">{brand}</span>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="product" className="py-24 px-4 bg-white rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-carbon font-display mb-6 tracking-tight">
              Everything in one place.
            </h2>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto">
              Replace your fragmented tech stack with one unified Operating System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Large Card 1 - Primary (Teal) */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-primary/5 border border-primary/10 p-10 md:p-14 transition-all hover:shadow-2xl hover:shadow-primary/20">
              <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                  <Store className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold text-carbon mb-4 tracking-tight">Intelligent POS</h3>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Fast, reliable, and built for speed. Handle complex modifiers, split bills, and table service with zero lag.
                </p>
              </div>
              {/* Abstract UI Element Mockup */}
              <div className="absolute right-[-20px] bottom-[-40px] w-[300px] h-[200px] bg-white rounded-3xl border border-stone-200 shadow-xl rotate-[-6deg] group-hover:rotate-[-8deg] group-hover:translate-y-[-10px] transition-all duration-500 p-6">
                 <div className="flex justify-between items-center mb-4">
                    <div className="h-3 w-24 bg-stone-100 rounded-full" />
                    <div className="h-8 w-8 bg-primary/20 rounded-full" />
                 </div>
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-stone-50 rounded-full" />
                    <div className="h-2 w-3/4 bg-stone-50 rounded-full" />
                    <div className="h-10 w-full bg-primary rounded-xl mt-4" />
                 </div>
              </div>
            </div>

            {/* Tall Card - Secondary (Berry) */}
            <div className="md:row-span-2 group relative overflow-hidden rounded-[2.5rem] bg-secondary text-white p-10 md:p-14 transition-all hover:shadow-2xl hover:shadow-secondary/30">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
               <div className="relative z-10 flex flex-col h-full">
                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20">
                    <TrendingUp className="w-7 h-7 text-white" />
                 </div>
                 <h3 className="text-3xl font-bold mb-4 tracking-tight">Real-time Analytics</h3>
                 <p className="text-lg text-white/80 mb-12 leading-relaxed">
                   Make decisions based on data, not gut feel. Track labor costs, COGS, and margins in real-time.
                 </p>
                 <div className="mt-auto w-full bg-black/20 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-2">
                       <div className="text-sm text-white/60">Net Sales</div>
                       <div className="text-2xl font-bold text-white">$12,450</div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[70%] bg-tertiary rounded-full" />
                    </div>
                    <div className="mt-2 text-xs text-tertiary font-medium">+24% vs last week</div>
                 </div>
               </div>
            </div>

            {/* Standard Card 2 - Tertiary (Giraffe) */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-tertiary/5 border border-tertiary/10 p-10 md:p-14 transition-all hover:shadow-2xl hover:shadow-tertiary/20">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-tertiary/20 shadow-sm">
                  <Smartphone className="w-7 h-7 text-tertiary" />
                </div>
                <h3 className="text-2xl font-bold text-carbon mb-3 tracking-tight">Online Ordering</h3>
                <p className="text-stone-600 leading-relaxed">
                  Commission-free ordering directly from your website. Integrated straight into the kitchen display.
                </p>
              </div>
            </div>

            {/* Standard Card 3 - Primary (Teal) variant */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-primary/5 border border-primary/10 p-10 md:p-14 transition-all hover:shadow-2xl hover:shadow-primary/20">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-primary/20 shadow-sm">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-carbon mb-3 tracking-tight">Loyalty & Marketing</h3>
                <p className="text-stone-600 leading-relaxed">
                  Automated campaigns that bring customers back. Track lifetime value and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="py-32 px-4 bg-carbon text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-stone-800 via-carbon to-carbon" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
           <h2 className="text-5xl md:text-7xl font-bold font-display mb-8 tracking-tighter">
             Ready to upgrade?
           </h2>
           <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-12">
             Join hundreds of high-volume cafes switching to Sippy for better control and higher profits.
           </p>
           <Button size="xl" className="bg-matcha-400 text-carbon hover:bg-matcha-300 font-bold h-16 px-12 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(168,224,47,0.4)] hover:shadow-[0_0_60px_-10px_rgba(168,224,47,0.6)] transition-all hover:scale-105">
             <Link href="/register">Start Free Trial</Link>
           </Button>
           <p className="mt-8 text-sm text-stone-500">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border/50 py-16 px-4">
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
                The all-in-one operating system for modern hospitality businesses.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20">
              <div>
                <h4 className="font-bold text-foreground mb-4">Product</h4>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li><Link href="#" className="hover:text-foreground">POS</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Inventory</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Analytics</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Loyalty</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4">Company</h4>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li><Link href="#" className="hover:text-foreground">About</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Press</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>© 2024 Sippy Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

