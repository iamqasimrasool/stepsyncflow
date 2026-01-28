import Link from "next/link";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: January 25, 2026
        </p>

        <Card className="mt-8">
          <CardHeader className="text-lg font-semibold">Summary</CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              These Terms govern access to StepSync Flow. By using the service, you
              agree to comply with these Terms and all applicable laws.
            </p>
            <p>
              You are responsible for your account, content you upload, and
              maintaining the security of your credentials.
            </p>
            <p>
              We may suspend or terminate accounts that violate these Terms or
              misuse the service.
            </p>
            <p>
              For questions, contact{" "}
              <Link href="mailto:hello@stepsyncflow.com" className="underline">
                hello@stepsyncflow.com
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <MarketingFooter />
      </div>
    </div>
  );
}

