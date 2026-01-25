import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold">
            StepSync
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your workspace.
          </p>
        </div>
        <Card>
          <CardHeader className="text-lg font-semibold">Log in</CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              <LoginForm />
            </Suspense>
            <p className="mt-4 text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/signup" className="text-foreground underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
