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
          Simple plans for teams of every size. (Placeholder)
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {["Starter", "Growth", "Enterprise"].map((plan) => (
            <Card key={plan}>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-xl font-semibold">{plan}</h2>
                <p className="text-sm text-muted-foreground">
                  Contact us for tailored pricing.
                </p>
                <Button className="w-full" variant="outline">
                  Talk to sales
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
