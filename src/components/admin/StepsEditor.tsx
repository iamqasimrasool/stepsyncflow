"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import YouTubePlayer, { YouTubePlayerHandle } from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { stepSchema, stepUpdateSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";
import FormError from "@/components/form/FormError";

type Step = {
  id: string;
  order: number;
  heading: string;
  body: string | null;
  timestamp: number;
};

type StepFormValues = {
  heading: string;
  body?: string;
  timestamp: number;
};

export default function StepsEditor({
  sopId,
  videoUrl,
  initialSteps,
}: {
  sopId: string;
  videoUrl: string;
  initialSteps: Step[];
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps]
  );

  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { heading: "", body: "", timestamp: 0 },
  });

  const editForm = useForm<StepFormValues>({
    resolver: zodResolver(stepUpdateSchema),
    defaultValues: { heading: "", body: "", timestamp: 0 },
  });

  const handleUseCurrentTime = () => {
    const current = Math.round(playerRef.current?.getCurrentTime() ?? 0);
    form.setValue("timestamp", current);
  };

  const handleAddStep = async (values: StepFormValues) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sops/${sopId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to add step");
      const data = await res.json();
      setSteps((prev) => [...prev, data.step]);
      form.reset({ heading: "", body: "", timestamp: 0 });
      toast.success("Step added");
    } catch (error) {
      toast.error("Could not add step");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/steps/${stepId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSteps((prev) => prev.filter((step) => step.id !== stepId));
      toast.success("Step deleted");
    } catch (error) {
      toast.error("Could not delete step");
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (step: Step) => {
    setEditingStep(step);
    editForm.reset({
      heading: step.heading,
      body: step.body ?? "",
      timestamp: step.timestamp,
    });
  };

  const handleEditSave = async (values: StepFormValues) => {
    if (!editingStep) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/steps/${editingStep.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSteps((prev) =>
        prev.map((step) => (step.id === data.step.id ? data.step : step))
      );
      setEditingStep(null);
      toast.success("Step updated");
    } catch (error) {
      toast.error("Could not update step");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (stepId: string, direction: "up" | "down") => {
    const index = sortedSteps.findIndex((step) => step.id === stepId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= sortedSteps.length) return;

    const reordered = [...sortedSteps];
    [reordered[index], reordered[swapWith]] = [
      reordered[swapWith],
      reordered[index],
    ];

    const payload = reordered.map((step, orderIndex) => ({
      id: step.id,
      order: orderIndex + 1,
    }));

    setSaving(true);
    try {
      const res = await fetch(`/api/sops/${sopId}/steps/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: payload }),
      });
      if (!res.ok) throw new Error("Failed");
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          order: payload.find((p) => p.id === step.id)?.order ?? step.order,
        }))
      );
      toast.success("Steps reordered");
    } catch (error) {
      toast.error("Could not reorder steps");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-background p-4">
        <h3 className="text-lg font-semibold">Video Preview</h3>
        <p className="text-sm text-muted-foreground">
          Use the current timestamp button to capture step times.
        </p>
        <div className="mt-4 space-y-3">
          <YouTubePlayer ref={playerRef} videoUrl={videoUrl} />
          <Button type="button" variant="secondary" onClick={handleUseCurrentTime}>
            Use current time
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4">
        <h3 className="text-lg font-semibold">Add Step</h3>
        <form
          onSubmit={form.handleSubmit(handleAddStep)}
          className="mt-4 space-y-3"
        >
          <Input
            placeholder="Step heading"
            {...form.register("heading")}
          />
          <FormError message={form.formState.errors.heading?.message} />
          <Textarea
            placeholder="Optional details"
            rows={3}
            {...form.register("body")}
          />
          <Input
            type="number"
            min={0}
            placeholder="Timestamp (seconds)"
            {...form.register("timestamp", { valueAsNumber: true })}
          />
          <FormError message={form.formState.errors.timestamp?.message} />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Step"}
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        {sortedSteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "rounded-xl border bg-background p-4",
              index === 0 && "border-primary/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{step.heading}</h4>
                <p className="text-sm text-muted-foreground">
                  {step.timestamp}s
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReorder(step.id, "up")}
                  disabled={index === 0 || saving}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleReorder(step.id, "down")}
                  disabled={index === sortedSteps.length - 1 || saving}
                >
                  Down
                </Button>
                <Button type="button" onClick={() => handleEditOpen(step)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDeleteStep(step.id)}
                  disabled={saving}
                >
                  Delete
                </Button>
              </div>
            </div>
            {step.body && (
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditSave)}
            className="space-y-3"
          >
            <Input placeholder="Step heading" {...editForm.register("heading")} />
            <FormError message={editForm.formState.errors.heading?.message} />
            <Textarea
              placeholder="Optional details"
              rows={3}
              {...editForm.register("body")}
            />
            <Input
              type="number"
              min={0}
              placeholder="Timestamp (seconds)"
              {...editForm.register("timestamp", { valueAsNumber: true })}
            />
            <FormError message={editForm.formState.errors.timestamp?.message} />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
