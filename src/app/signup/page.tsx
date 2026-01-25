import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold">
            StepSync Flow
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your workspace in minutes.
          </p>
        </div>
        <Card>
          <CardHeader className="text-lg font-semibold">Create workspace</CardHeader>
          <CardContent>
            <SignupForm />
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
