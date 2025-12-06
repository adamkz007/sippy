import Link from "next/link"
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react"

import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$39",
    cadence: "per month",
    description: "Ideal for new locations getting off spreadsheets.",
    features: [
      "Full POS with table & course support",
      "Unlimited devices and staff logins",
      "Menu management with modifiers",
      "Basic reporting & daily email digest",
      "Email support and help center",
    ],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    price: "$89",
    cadence: "per month",
    description: "For busy cafes that need automation and loyalty.",
    features: [
      "All Starter features",
      "Advanced analytics & labor insights",
      "Built-in loyalty with SMS & email",
      "Inventory with vendor tracking",
      "Priority support with chat",
    ],
    popular: true,
    cta: "Talk to sales",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "let’s design it",
    description: "Multi-location teams with governance & integrations.",
    features: [
      "All Growth features",
      "API access & data warehouse sync",
      "Role-based permissions & SSO",
      "Menu and pricing controls by region",
      "Dedicated CSM & on-site training",
    ],
    cta: "Book a demo",
  },
]

const guarantees = [
  {
    title: "No long contracts",
    description: "Month-to-month with transparent invoices. Upgrade only when you’re sure.",
  },
  {
    title: "White-glove onboarding",
    description: "Menu import, staff training, and hardware pairing handled by our team.",
  },
  {
    title: "99.95% uptime SLA",
    description: "Redundant sync for offline resilience so service never stops.",
  },
]

const extras = [
  {
    title: "Payments",
    description: "Keep your existing processor or switch to Sippy Pay for better rates and faster payouts.",
    icon: ShieldCheck,
  },
  {
    title: "Success hours",
    description: "Operator office hours every week with benchmarks, playbooks, and Q&A.",
    icon: Sparkles,
  },
  {
    title: "Hardware",
    description: "Works with industry-standard printers, cash drawers, and kitchen displays.",
    icon: CheckCircle2,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main className="pt-40 pb-24 px-4">
        <section className="max-w-5xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 bg-white/80">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
            Pricing built for busy cafes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Straightforward plans that scale with every new line out the door. No hidden fees, ever.
          </p>
        </section>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white border border-border/70 rounded-3xl p-8 flex flex-col h-full shadow-sm ${
                plan.popular ? "ring-2 ring-secondary/40 shadow-xl" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shadow-lg shadow-secondary/20">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold tracking-tight text-carbon">{plan.name}</h3>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-carbon">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full h-12 ${plan.popular ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/register">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto mt-16 bg-white border border-border rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            {guarantees.map((item) => (
              <div key={item.title}>
                <h4 className="text-lg font-semibold text-carbon mb-2">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {extras.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-border rounded-2xl p-6 flex items-start gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h5 className="font-semibold text-carbon mb-1">{item.title}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto mt-20 text-center bg-secondary text-secondary-foreground rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
              Have more than 5 locations?
            </h3>
            <p className="text-lg text-secondary-foreground/80 max-w-3xl mx-auto mb-8">
              We’ll tailor implementation, workflows, and reporting to match your org chart and existing tools.
            </p>
            <Button size="lg" asChild className="bg-white text-secondary hover:bg-cream-200 px-8 h-12 font-semibold rounded-full">
              <Link href="/register">
                Speak with us
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

