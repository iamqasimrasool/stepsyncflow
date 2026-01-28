import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold">Refund Policy</h1>
        <p className="text-sm text-muted-foreground">
          We want you to feel confident using StepSync Flow. Here is how refunds work.
        </p>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">Monthly plans</h2>
          <p>
            You can cancel anytime. Charges are not refunded for partial months.
          </p>
        </section>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">Annual plans</h2>
          <p>
            Annual subscriptions are refundable within 30 days of purchase.
          </p>
        </section>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">How to request</h2>
          <p>
            Contact support at hello@stepsyncflow.com with your workspace details.
          </p>
        </section>
      </main>
      <div className="mx-auto w-full max-w-5xl px-4 pb-12">
        <MarketingFooter />
      </div>
    </div>
  );
}
