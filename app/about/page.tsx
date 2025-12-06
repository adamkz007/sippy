import Link from "next/link"
import { ArrowRight, Heart, ShieldCheck, Sparkles, Users } from "lucide-react"

import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const values = [
  {
    title: "Hospitality first",
    description: "Decisions start with guests and the people serving them — not the tech.",
    icon: Heart,
  },
  {
    title: "Operational empathy",
    description: "We ship features that shave minutes off a shift, not add toggles.",
    icon: Sparkles,
  },
  {
    title: "Reliability over flash",
    description: "Offline resilience, strong SLAs, and real humans on support.",
    icon: ShieldCheck,
  },
]

const stats = [
  { label: "Cafes powered", value: "320+" },
  { label: "Avg. ticket uplift", value: "+11%" },
  { label: "Uptime last 12m", value: "99.96%" },
  { label: "Countries served", value: "7" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main className="pt-40 pb-24 px-4">
        <section className="max-w-5xl mx-auto text-center mb-14">
          <Badge variant="outline" className="mb-4 bg-white/80">
            About Sippy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            We build calm, reliable systems for busy cafes
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Sippy was started by operators who have burned the 5am shift. We focus on resilient tools that keep guests
            delighted and teams confident when the rush hits.
          </p>
        </section>

        <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-border rounded-2xl p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-carbon">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto bg-white border border-border rounded-3xl p-8 md:p-12 mb-14">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-carbon">Our story</h2>
              <p className="text-muted-foreground leading-relaxed">
                We watched great cafes struggle with brittle POS systems, scattered spreadsheets, and loyalty programs
                that never quite connected. Sippy began as a small project to unify the daily stack — tickets, labor,
                inventory, and guest journeys — in one calm place.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we partner with operators across cities to pilot new workflows, release incremental improvements,
                and keep the bar running smoothly. Our product decisions are guided by live cafe feedback and weekly time
                on the floor.
              </p>
              <div className="flex items-center gap-4">
                <Button asChild className="rounded-full px-6">
                  <Link href="/demo">
                    See how we work
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="rounded-full">
                  <Link href="/resources">
                    Read our playbook
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-primary/40 border border-primary/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-carbon">What we focus on</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-secondary mt-1" />
                  <span>Fast onboarding for staff so new hires feel confident on day one.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-secondary mt-1" />
                  <span>Offline-first reliability with automatic sync and clear fallbacks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-secondary mt-1" />
                  <span>Insights that operators actually act on, not dashboards for show.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-carbon mb-6">Our values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-carbon mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="max-w-5xl mx-auto bg-secondary text-secondary-foreground rounded-3xl p-10 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-bold font-display tracking-tight">Let’s meet your team</h3>
            <p className="text-secondary-foreground/80 max-w-3xl mx-auto">
              Share your biggest operational headaches. We’ll tailor a walkthrough and connect you with operators who’ve
              solved similar problems.
            </p>
            <Button size="lg" asChild className="bg-white text-secondary hover:bg-cream-200 rounded-full px-8">
              <Link href="/register">
                Book time
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

