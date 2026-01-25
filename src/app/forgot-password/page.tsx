"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormError from "@/components/form/FormError";
import { z } from "zod";

type ForgotValues = z.input<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Could not send reset email.";
        throw new Error(message);
      }
      if (typeof data?.resetUrl === "string") {
        setResetUrl(data.resetUrl);
      } else {
        setResetUrl(null);
      }
      toast.success("Check your email for a reset link.");
      form.reset({ email: "" });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not send reset email.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold">
            StepSync
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            We will email you a reset link.
          </p>
        </div>
        <Card>
          <CardHeader className="text-lg font-semibold">Reset password</CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Input placeholder="Email" {...form.register("email")} />
                <FormError message={form.formState.errors.email?.message} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
            {resetUrl && (
              <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Reset link</p>
                <a className="break-all text-foreground underline" href={resetUrl}>
                  {resetUrl}
                </a>
              </div>
            )}
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

