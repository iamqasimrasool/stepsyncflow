import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            StepSync
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground">
            Pricing
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: January 25, 2026
        </p>

        <Card className="mt-8">
          <CardHeader className="text-lg font-semibold">Summary</CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              These Terms govern access to StepSync. By using the service, you
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
    </div>
  );
}

