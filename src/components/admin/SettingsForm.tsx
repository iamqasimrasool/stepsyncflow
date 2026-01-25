"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { departmentSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsValues = { name: string };

export default function SettingsForm({ orgName }: { orgName: string }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<SettingsValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: orgName },
  });

  const onSubmit = async (values: SettingsValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/org", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings updated");
    } catch (error) {
      toast.error("Could not update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Input placeholder="Organization name" {...form.register("name")} />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
