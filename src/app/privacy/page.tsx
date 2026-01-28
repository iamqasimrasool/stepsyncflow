import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          This policy explains how StepSync Flow collects, uses, and protects your data.
        </p>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">What we collect</h2>
          <p>
            Account details, workspace data, and usage analytics needed to deliver the service.
          </p>
          <p>
            We do not sell your data. We only use it to operate, secure, and improve StepSync Flow.
          </p>
        </section>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">How we use data</h2>
          <p>
            Data is used to authenticate users, store SOPs, enable collaboration, and provide support.
          </p>
        </section>
        <section className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">Your choices</h2>
          <p>
            You can request access, export, or deletion of your data by contacting support.
          </p>
        </section>
      </main>
      <div className="mx-auto w-full max-w-5xl px-4 pb-12">
        <MarketingFooter />
      </div>
    </div>
  );
}
