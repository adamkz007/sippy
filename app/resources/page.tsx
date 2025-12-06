import Link from "next/link"
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, DownloadCloud, Lightbulb } from "lucide-react"

import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const plays = [
  {
    title: "Stabilize the floor",
    points: [
      "Prep board that mirrors your menu structure to keep the line flowing.",
      "Color-coded order screens that separate dine-in, pickup, and delivery.",
      "Shift huddles with yesterday’s top 3 wins + 1 focus to reduce variance.",
    ],
  },
  {
    title: "Guard your costs",
    points: [
      "Track labor as a live percentage of net sales with alerts when you exceed the target range.",
      "Recipe-level COGS with vendor pricing deltas automatically flagged.",
      "Use waste logging to auto-adjust next-day prep suggestions.",
    ],
  },
  {
    title: "Build loyalty loops",
    points: [
      "Enroll guests at the register with a single phone field.",
      "Automated reactivation journeys for guests who haven’t visited in 21 days.",
      "Segment high-frequency guests and test A/B offers without new tooling.",
    ],
  },
]

const downloads = [
  {
    title: "Opening checklist for bar leads",
    detail: "Printable PDF and Google Sheets template.",
  },
  {
    title: "Cost control tracker",
    detail: "Weekly COGS + labor guardrails with benchmarks.",
  },
  {
    title: "Loyalty offer playbook",
    detail: "Four tested campaigns that lift repeat visits by 12-18%.",
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main className="pt-40 pb-24 px-4">
        <section className="max-w-4xl mx-auto text-center mb-14">
          <Badge variant="outline" className="mb-4 bg-white/80">
            Resources
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            Cafe Operations Playbook: Run smoother, every shift
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Updated Nov 2024
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              8 minute read
            </span>
          </div>
        </section>

        <article className="max-w-4xl mx-auto bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm space-y-10">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              High-volume cafes don’t win with more SKUs—they win with consistency and speed. This guide shares the
              playbook we deploy with operators to tighten the floor, protect margins, and keep guests coming back.
            </p>
            <div className="bg-primary/30 border border-primary/50 rounded-2xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-secondary mt-0.5" />
              <p className="text-sm text-foreground">
                TL;DR: Start with a single source of truth for the shift, measure the two levers you control (labor and
                COGS), and automate the guest follow-up that your baristas don’t have time to run.
              </p>
            </div>
          </div>

          <div className="space-y-8" id="operations">
            {plays.map((play) => (
              <section key={play.title} className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold text-carbon">{play.title}</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {play.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-1" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="space-y-4" id="playbooks">
            <h3 className="text-xl md:text-2xl font-semibold text-carbon">Signals to watch weekly</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/60 rounded-2xl p-4 border border-border/70">
                <h4 className="font-semibold text-carbon mb-2">Labor % of net sales</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep between 28-32% on weekdays and 30-34% on weekends. Use staggered breaks and predictive staffing
                  to avoid overtime spikes.
                </p>
              </div>
              <div className="bg-muted/60 rounded-2xl p-4 border border-border/70">
                <h4 className="font-semibold text-carbon mb-2">Waste & prep deltas</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Measure waste by category daily. If prep deltas swing more than 10%, tighten par guides and vendor
                  deliveries.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4" id="downloads">
            <h3 className="text-xl md:text-2xl font-semibold text-carbon">Downloads</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {downloads.map((item) => (
                <div key={item.title} className="border border-border rounded-2xl p-4 bg-white shadow-sm">
                  <div className="flex items-start gap-3">
                    <DownloadCloud className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-semibold text-carbon">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Want the full toolkit?</p>
                <p className="text-secondary-foreground/80">
                  Get the editable versions plus weekly operator tips in your inbox.
                </p>
              </div>
              <Button asChild className="bg-white text-secondary hover:bg-cream-200 px-6 rounded-full">
                <Link href="/register">
                  Get the kit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </article>

        <section className="max-w-4xl mx-auto mt-14 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-white border border-border shadow-sm">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Prefer a walkthrough? We’ll show you live.</span>
            <Button variant="ghost" asChild className="h-8 px-3 text-secondary hover:text-foreground">
              <Link href="/demo">
                Watch demo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

