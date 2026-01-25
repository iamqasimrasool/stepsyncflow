"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { departmentSchema } from "@/lib/validators";

type Department = { id: string; name: string };

type DepartmentValues = { name: string };

export default function DepartmentsManager({
  initialDepartments,
}: {
  initialDepartments: Department[];
}) {
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [editing, setEditing] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<DepartmentValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "" },
  });

  const editForm = useForm<DepartmentValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "" },
  });

  const handleCreate = async (values: DepartmentValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDepartments((prev) => [...prev, data.department]);
      form.reset({ name: "" });
      toast.success("Department created");
    } catch (error) {
      toast.error("Could not create department");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (dept: Department) => {
    setEditing(dept);
    editForm.reset({ name: dept.name });
  };

  const handleEditSave = async (values: DepartmentValues) => {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/departments/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === data.department.id ? data.department : dept))
      );
      setEditing(null);
      toast.success("Department updated");
    } catch (error) {
      toast.error("Could not update department");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deptId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Unable to delete department");
        return;
      }
      setDepartments((prev) => prev.filter((dept) => dept.id !== deptId));
      toast.success("Department deleted");
    } catch (error) {
      toast.error("Could not delete department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(handleCreate)}
        className="flex flex-col gap-3 md:flex-row"
      >
        <Input placeholder="New department name" {...form.register("name")} />
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add department"}
        </Button>
      </form>

      <div className="space-y-3">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex flex-col gap-2 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
          >
            <p className="font-medium">{dept.name}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditOpen(dept)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(dept.id)}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditSave)}
            className="space-y-3"
          >
            <Input placeholder="Department name" {...editForm.register("name")} />
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
