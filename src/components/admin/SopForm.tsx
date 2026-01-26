"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sopSchema } from "@/lib/validators";
import { VideoType } from "@prisma/client";
import FormError from "@/components/form/FormError";

type Department = { id: string; name: string };
type Section = { id: string; title: string; departmentId: string };

type SopFormValues = z.input<typeof sopSchema>;

export default function SopForm({
  departments,
  sections,
  initial,
}: {
  departments: Department[];
  sections: Section[];
  initial?: {
    id: string;
    title: string;
    summary: string | null;
    departmentId: string;
    sectionId: string | null;
    videoType: VideoType;
    videoUrl: string;
    isPublished: boolean;
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const form = useForm<SopFormValues>({
    resolver: zodResolver(sopSchema),
    defaultValues: {
      title: initial?.title ?? "",
      summary: initial?.summary ?? "",
      departmentId: initial?.departmentId ?? departments[0]?.id ?? "",
      sectionId: initial?.sectionId ?? "",
      videoType: initial?.videoType ?? VideoType.YOUTUBE,
      videoUrl: initial?.videoUrl ?? "",
      isPublished: initial?.isPublished ?? true,
    },
  });

  const selectedDepartmentId = form.watch("departmentId");
  const selectedSectionId = form.watch("sectionId");
  const availableSections = sections.filter(
    (section) => section.departmentId === selectedDepartmentId
  );

  useEffect(() => {
    if (!selectedSectionId) return;
    const exists = availableSections.some(
      (section) => section.id === selectedSectionId
    );
    if (!exists) {
      form.setValue("sectionId", "");
    }
  }, [availableSections, form, selectedSectionId]);

  const onSubmit = async (values: SopFormValues) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        sectionId: values.sectionId ? values.sectionId : null,
      };
      const res = await fetch(
        initial ? `/api/sops/${initial.id}` : "/api/sops",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save SOP");
      const data = await res.json();
      toast.success("SOP saved");
      if (!initial) {
        router.push(`/app/admin/sops/${data.sop.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error("Could not save SOP");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Input placeholder="SOP title" {...form.register("title")} />
        <FormError message={form.formState.errors.title?.message} />
      </div>
      <Textarea
        placeholder="Short summary"
        rows={3}
        {...form.register("summary")}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Department</span>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            {...form.register("departmentId")}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <FormError message={form.formState.errors.departmentId?.message} />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Section</span>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            {...form.register("sectionId")}
          >
            <option value="">Unassigned</option>
            {availableSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Video Type</span>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            {...form.register("videoType")}
          >
            <option value={VideoType.YOUTUBE}>YouTube</option>
          </select>
        </label>
      </div>
      <div className="space-y-1">
        <Input
          placeholder="YouTube URL or ID"
          {...form.register("videoUrl")}
        />
        <FormError message={form.formState.errors.videoUrl?.message} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isPublished")} />
        Publish SOP
      </label>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save SOP"}
      </Button>
    </form>
  );
}
