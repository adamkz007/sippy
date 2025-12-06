import { Badge } from "@/components/ui/badge"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"

const sections = [
  {
    title: "Information we collect",
    body: [
      "Account data such as name, email, role, and authentication identifiers.",
      "Cafe data such as menu items, orders, customer profiles, and transaction history.",
      "Device and usage data including IP address, browser type, and product interaction events.",
      "Support communications, including chat transcripts and call notes.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "Provide and improve the Sippy platform, including analytics and recommendations.",
      "Secure accounts, prevent fraud, and monitor platform reliability.",
      "Send operational communications such as receipts, alerts, and product updates.",
      "Comply with legal obligations and enforce our terms.",
    ],
  },
  {
    title: "Sharing and disclosures",
    body: [
      "Service providers under contract who process data on our behalf (e.g., hosting, support, payments).",
      "Integration partners you choose to connect, following your instructions.",
      "Legal or safety requirements, if we must respond to lawful requests or protect users.",
      "Business transfers in connection with mergers, acquisitions, or asset sales.",
    ],
  },
  {
    title: "Data retention and security",
    body: [
      "We retain personal data for as long as your account is active or as needed to provide services.",
      "Backups are encrypted in transit and at rest; production access is audited and least-privilege.",
      "You may request deletion of customer data; some records may be kept where required by law.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Access, correct, or export your personal data.",
      "Request deletion where applicable and opt out of marketing communications.",
      "Manage data sharing with integrations via your workspace settings.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main className="pt-40 pb-24 px-4">
        <div className="max-w-4xl mx-auto bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="bg-white/80">Privacy</Badge>
            <h1 className="text-4xl font-bold font-display tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Effective: December 6, 2025</p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We respect the data you trust to Sippy. This policy explains what we collect, how we use it, and the
              choices you have.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-carbon">{section.title}</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {section.body.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-carbon">Contact</h2>
            <p className="text-muted-foreground">
              Questions about privacy or data requests? Email privacy@sippy.app and we’ll respond within a reasonable
              timeframe.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

