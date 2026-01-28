import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Create a workspace",
    body: "Sign up and invite teammates to your workspace.",
  },
  {
    title: "Add a flow",
    body: "Upload a YouTube link, add steps with timestamps, and publish.",
  },
  {
    title: "Assign departments",
    body: "Control who can view or edit each flow with department access.",
  },
  {
    title: "Share and track",
    body: "Use public links or sections to share and keep teams aligned.",
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl space-y-10 px-4 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">How to use StepSync Flow</h1>
          <p className="text-sm text-muted-foreground">
            A quick guide to get your SOPs live in minutes.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Step {index + 1}
                </p>
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold">Need help?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out to hello@stepsyncflow.com and we will get you set up.
          </p>
        </section>
      </main>
      <div className="mx-auto w-full max-w-5xl px-4 pb-12">
        <MarketingFooter />
      </div>
    </div>
  );
}
