import { Badge } from "@/components/ui/badge"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingHeader } from "@/components/marketing/marketing-header"

const sections = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using Sippy, you agree to these Terms and our Privacy Policy.",
      "If you use Sippy on behalf of an organization, you represent you have authority to bind that organization.",
    ],
  },
  {
    title: "2. Accounts and access",
    body: [
      "You must maintain accurate account information and keep credentials secure.",
      "You are responsible for activities under your account, including actions by staff you provision.",
    ],
  },
  {
    title: "3. Acceptable use",
    body: [
      "Do not interfere with or disrupt the platform, attempt unauthorized access, or misuse data.",
      "Respect applicable laws, including those governing privacy, payments, and consumer protection.",
    ],
  },
  {
    title: "4. Payment and renewals",
    body: [
      "Unless otherwise stated, plans are billed monthly in advance and renew automatically.",
      "Fees are non-refundable except where required by law. Taxes may apply.",
    ],
  },
  {
    title: "5. Intellectual property",
    body: [
      "Sippy and its content are owned by Sippy Inc. or licensors. No rights are granted except as set out here.",
      "You retain rights to your data. We may use aggregated, de-identified data to improve the service.",
    ],
  },
  {
    title: "6. Service changes",
    body: [
      "We may modify features with notice where material. We aim to avoid disruptions to active operations.",
      "If we discontinue the service, we will provide reasonable notice and data export options.",
    ],
  },
  {
    title: "7. Termination",
    body: [
      "You may cancel at any time via your account settings. Access will continue through the paid period.",
      "We may suspend or terminate for breach of these Terms, harm to the service, or legal obligations.",
    ],
  },
  {
    title: "8. Disclaimers and liability",
    body: [
      "The service is provided “as is” to the fullest extent permitted by law.",
      "Our liability is limited to the amount paid for the service in the 12 months preceding the claim.",
    ],
  },
  {
    title: "9. Governing law",
    body: [
      "These Terms are governed by the laws of Delaware, USA, unless otherwise required by applicable law.",
      "Disputes will be resolved in the courts of Delaware, except where prohibited.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "For questions about these Terms, contact legal@sippy.app.",
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary/30 selection:text-foreground">
      <MarketingHeader />

      <main className="pt-40 pb-24 px-4">
        <div className="max-w-4xl mx-auto bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="bg-white/80">Legal</Badge>
            <h1 className="text-4xl font-bold font-display tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Effective: December 6, 2025</p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Please read these Terms carefully. By using Sippy you agree to them. If you do not agree, do not use the
              service.
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
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

