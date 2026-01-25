import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold">
            StepSync Flow
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Set a new password for your account.
          </p>
        </div>
        <Card>
          <CardHeader className="text-lg font-semibold">Reset password</CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
            <p className="mt-4 text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link href="/login" className="text-foreground underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

