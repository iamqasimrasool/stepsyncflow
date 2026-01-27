import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            StepSync Flow
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/how-to-use" className="text-sm text-muted-foreground">
              How to use
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground">
              Log in
            </Link>
            <Button asChild variant="outline">
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Per-seat pricing that scales with your team. No video hosting fees.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Starter</h2>
              <div>
                <p className="text-3xl font-semibold">$0</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Up to 3 seats. Great for getting started.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 5 flows with video steps</li>
                <li>• Basic search & playback</li>
                <li>• Email support</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Growth</h2>
              <div>
                <p className="text-3xl font-semibold">$5</p>
                <p className="text-xs text-muted-foreground">per seat / month</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Per seat, per month. No minimum seats.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Unlimited flows</li>
                <li>• Department access controls</li>
                <li>• Comments & public links</li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Upgrade to Growth</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Scale</h2>
              <div>
                <p className="text-3xl font-semibold">$4</p>
                <p className="text-xs text-muted-foreground">per seat / month</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Per seat, per month. 10-seat minimum.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Priority support</li>
                <li>• Advanced reporting</li>
                <li>• Section-level sharing</li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Upgrade to Scale</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Enterprise</h2>
              <div>
                <p className="text-3xl font-semibold">Custom</p>
                <p className="text-xs text-muted-foreground">annual billing</p>
              </div>
              <p className="text-sm text-muted-foreground">
                SSO, SLA, and custom compliance needs.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Dedicated success manager</li>
                <li>• Security reviews & SLAs</li>
                <li>• Custom integrations</li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="mailto:hello@stepsyncflow.com">Talk to sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p>© 2026 StepSync Flow. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              <Link href="/refund" className="underline">
                Refund Policy
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
