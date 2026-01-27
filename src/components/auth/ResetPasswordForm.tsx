"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormError from "@/components/form/FormError";

const formSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") ?? "", [searchParams]);
  const [loading, setLoading] = useState(false);
  const form = useForm<ResetValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Could not reset password.";
        throw new Error(message);
      }
      toast.success("Password reset. You can log in now.");
      form.reset({ password: "", confirmPassword: "" });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not reset password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Input
          placeholder="New password"
          type="password"
          {...form.register("password")}
        />
        <FormError message={form.formState.errors.password?.message} />
      </div>
      <div className="space-y-1">
        <Input
          placeholder="Confirm new password"
          type="password"
          {...form.register("confirmPassword")}
        />
        <FormError message={form.formState.errors.confirmPassword?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}

