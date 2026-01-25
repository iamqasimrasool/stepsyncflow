"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signupSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormError from "@/components/form/FormError";

type SignupValues = {
  orgName: string;
  name: string;
  email: string;
  password: string;
};

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { orgName: "", name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Signup failed");

      await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      toast.success("Workspace created!");
      router.push("/app");
    } catch (error) {
      toast.error("Could not create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Input placeholder="Organization name" {...form.register("orgName")} />
        <FormError message={form.formState.errors.orgName?.message} />
      </div>
      <div className="space-y-1">
        <Input placeholder="Your name" {...form.register("name")} />
        <FormError message={form.formState.errors.name?.message} />
      </div>
      <div className="space-y-1">
        <Input placeholder="Email" {...form.register("email")} />
        <FormError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-1">
        <Input
          placeholder="Password"
          type="password"
          {...form.register("password")}
        />
        <FormError message={form.formState.errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
}
