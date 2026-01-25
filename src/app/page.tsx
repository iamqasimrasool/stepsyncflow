import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            StepSync
          </Link>
          <div className="flex items-center gap-3">
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
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase text-muted-foreground">
              Video-synced SOPs
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Turn YouTube videos into guided, clickable SOPs.
            </h1>
            <p className="text-lg text-muted-foreground">
              StepSync keeps teams aligned with timestamped steps, mobile-first
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
          <Card className="border-dashed">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">What teams love</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tap a step to jump the video instantly.</li>
                <li>• Assign SOPs to departments with RBAC controls.</li>
                <li>• Designed for mobile-first operations teams.</li>
              </ul>
            </CardContent>
          </Card>
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
      </main>
    </div>
  );
}
