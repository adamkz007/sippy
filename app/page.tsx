import Image from "next/image"
import Link from "next/link"
import { Store, TrendingUp, Users, ArrowRight, Smartphone } from "lucide-react"

import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main>
        {/* Hero Section */}
        <section className="pt-48 pb-24 md:pt-60 md:pb-32 px-4 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">OS for cafes</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-bold text-foreground font-display leading-[0.9] mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                  Clarity <br/>
                  <span className="text-muted-foreground">for your café.</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl lg:mx-0 mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  Streamline your café operations. Pour good coffee. And keep customers coming back.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <Button size="xl" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-16 px-10 text-lg shadow-xl shadow-primary/20 rounded-full transition-all hover:-translate-y-1">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild className="h-16 px-10 text-lg rounded-full border-2 border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:-translate-y-1">
                    <Link href="/demo">
                      View Live Demo
                    </Link>
                  </Button>
                </div>

              </div>

              {/* Hero Image */}
              <div className="hidden lg:block relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent blur-3xl -z-10" />
                <div className="relative w-full overflow-hidden rounded-[2rem] border border-border shadow-2xl shadow-primary/10">
                  <Image
                    src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1200&fit=crop"
                    alt="Barista crafting coffee in a cozy café"
                    width={900}
                    height={900}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Social Proof - full width */}
            <div className="mt-16 pt-10 border-t border-border/60 animate-in fade-in duration-1000 delay-500">
              <p className="text-sm font-medium text-muted-foreground mb-6 text-center lg:text-left">TRUSTED BY FORWARD-THINKING CAFES</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
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
                   <p className="text-lg text-white/80 mb-6 leading-relaxed">
                     Make decisions based on data, not gut feel. Track labor costs, COGS, and margins in real-time.
                   </p>
                   <div className="mt-auto w-full bg-cream-200/20 rounded-2xl border border-cream-200/30 p-5 backdrop-blur-sm -mx-2">
                      <div className="flex justify-between items-end mb-2">
                         <div className="text-sm text-cream-200/70">Net Sales</div>
                         <div className="text-2xl font-bold text-cream-100">{formatCurrency(12450)}</div>
                      </div>
                      <div className="h-1 w-full bg-cream-200/20 rounded-full overflow-hidden">
                         <div className="h-full w-[70%] bg-cream-200 rounded-full" />
                      </div>
                      <div className="mt-2 text-xs text-cream-200 font-medium">+24% vs last week</div>
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
                {/* Phone Mockup */}
                <div className="absolute right-[-30px] bottom-[-60px] w-[140px] h-[240px] bg-espresso-900 rounded-[2rem] border-4 border-espresso-800 shadow-xl rotate-[8deg] group-hover:rotate-[12deg] group-hover:translate-y-[-8px] transition-all duration-500 p-2">
                  <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                    {/* Phone Screen Content */}
                    <div className="bg-tertiary h-12 flex items-center justify-center">
                      <div className="w-8 h-1.5 bg-white/30 rounded-full" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-2 w-16 bg-stone-200 rounded-full" />
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-cream-200 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-1.5 w-full bg-stone-100 rounded-full" />
                          <div className="h-1.5 w-2/3 bg-stone-100 rounded-full" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-cream-300 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-1.5 w-full bg-stone-100 rounded-full" />
                          <div className="h-1.5 w-1/2 bg-stone-100 rounded-full" />
                        </div>
                      </div>
                      <div className="h-8 w-full bg-tertiary rounded-lg mt-3" />
                    </div>
                  </div>
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
                {/* Stacked Loyalty Cards Mockup */}
                <div className="absolute right-[-20px] bottom-[-30px]">
                  {/* Back Card */}
                  <div className="absolute top-2 left-2 w-[160px] h-[100px] bg-espresso-200 rounded-2xl border border-espresso-300 shadow-lg rotate-[-12deg]" />
                  {/* Middle Card */}
                  <div className="absolute top-1 left-1 w-[160px] h-[100px] bg-cream-300 rounded-2xl border border-cream-400 shadow-lg rotate-[-6deg]" />
                  {/* Front Card */}
                  <div className="relative w-[160px] h-[100px] bg-gradient-to-br from-primary to-cream-300 rounded-2xl border border-primary/20 shadow-xl rotate-[3deg] group-hover:rotate-[6deg] group-hover:translate-y-[-6px] transition-all duration-500 p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="h-1.5 w-12 bg-white/40 rounded-full" />
                        <div className="h-1 w-8 bg-white/30 rounded-full" />
                      </div>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white/40 rounded-full" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-5 h-5 rounded-full border-2 border-white/50 ${i < 3 ? 'bg-white/80' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <div className="mt-2 h-1 w-16 bg-white/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="py-32 px-4 text-white relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-espresso-950/85 backdrop-blur-[2px]" />
          {/* Gradient Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-espresso-900/50 via-transparent to-cream-200/10" />
          
          <div className="container mx-auto max-w-4xl text-center relative z-10">
             <h2 className="text-5xl md:text-7xl font-bold font-display mb-8 tracking-tighter text-cream-100">
               Ready to upgrade?
             </h2>
             <p className="text-xl text-cream-300/80 max-w-2xl mx-auto mb-12">
               Join hundreds of high-volume cafes switching to Sippy for better control and higher profits.
             </p>
             <Button size="xl" className="bg-cream-200 text-espresso-900 hover:bg-cream-100 font-bold h-16 px-12 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(253,224,182,0.5)] hover:shadow-[0_0_60px_-10px_rgba(253,224,182,0.7)] transition-all hover:scale-105">
               <Link href="/register">Start Free Trial</Link>
             </Button>
             <p className="mt-8 text-sm text-cream-300/60">No credit card required. 14-day free trial.</p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

