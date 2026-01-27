import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const heroVideoUrl =
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            StepSync Flow
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/how-to-use" className="text-sm text-muted-foreground">
              How to use
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12">
        <section className="relative overflow-hidden rounded-3xl border bg-muted/20">
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-background/70" />
          </div>
          <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              Video-synced SOPs
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Turn videos into guided, clickable SOPs.
            </h1>
            <p className="text-lg text-muted-foreground">
              StepSync Flow keeps teams aligned with timestamped steps, mobile-first
              playback, and department-level access.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Create workspace</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
          <Card className="border-dashed bg-background/80">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">What teams love</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tap a step to jump the video instantly.</li>
                <li>• Assign SOPs to departments with RBAC controls.</li>
                <li>• Designed for mobile-first operations teams.</li>
              </ul>
            </CardContent>
          </Card>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Multi-tenant ready",
              body: "Org-level isolation with scoped queries and sessions.",
            },
            {
              title: "Role-based access",
              body: "OWNER to VIEWER roles with department scoping.",
            },
            {
              title: "Swap video hosts",
              body: "YouTube today, Vimeo or S3 tomorrow.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-2 p-5">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
        <footer className="border-t pt-8 text-sm text-muted-foreground">
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
