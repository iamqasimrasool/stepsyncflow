import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            StepSync
          </Link>
          <Button asChild variant="outline">
            <Link href="/signup">Start free</Link>
          </Button>
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
              <p className="text-3xl font-semibold">$0</p>
              <p className="text-sm text-muted-foreground">
                Up to 3 seats. Great for getting started.
              </p>
              <Button className="w-full" asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Growth</h2>
              <p className="text-3xl font-semibold">$5</p>
              <p className="text-sm text-muted-foreground">
                Per seat, per month. No minimum seats.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Upgrade to Growth</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Scale</h2>
              <p className="text-3xl font-semibold">$4</p>
              <p className="text-sm text-muted-foreground">
                Per seat, per month. 10-seat minimum.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Upgrade to Scale</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">Enterprise</h2>
              <p className="text-3xl font-semibold">Custom</p>
              <p className="text-sm text-muted-foreground">
                SSO, SLA, and custom compliance needs.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="mailto:hello@stepsyncflow.com">Talk to sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
