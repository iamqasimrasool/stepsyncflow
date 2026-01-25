"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userInviteSchema, userUpdateSchema } from "@/lib/validators";
import { Role } from "@prisma/client";

type Department = { id: string; name: string };
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departments: { department: Department }[];
};

type InviteValues = z.input<typeof userInviteSchema>;
type UpdateValues = z.input<typeof userUpdateSchema>;

export default function UsersManager({
  initialUsers,
  departments,
}: {
  initialUsers: UserRow[];
  departments: Department[];
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);

  const inviteForm = useForm<InviteValues>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.EDITOR,
      departmentIds: [],
    },
  });

  const editForm = useForm<UpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {},
  });

  const roleOptions = useMemo(
    () => Object.values(Role).filter((role) => role !== Role.OWNER),
    []
  );

  const handleInvite = async (values: InviteValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers((prev) => [
        ...prev,
        { ...data.user, departments: [] },
      ]);
      inviteForm.reset();
      toast.success("User added");
    } catch (error) {
      toast.error("Could not add user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (user: UserRow) => {
    setEditing(user);
    editForm.reset({
      name: user.name,
      role: user.role,
      departmentIds: user.departments.map((d) => d.department.id),
    });
  };

  const handleEditSave = async (values: UpdateValues) => {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === data.user.id
            ? {
                ...user,
                name: data.user.name,
                role: data.user.role,
                departments: values.departmentIds
                  ? values.departmentIds.map((id) => ({
                      department: departments.find((d) => d.id === id)!,
                    }))
                  : user.departments,
              }
            : user
        )
      );
      setEditing(null);
      toast.success("User updated");
    } catch (error) {
      toast.error("Could not update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Unable to delete user");
        return;
      }
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User removed");
    } catch (error) {
      toast.error("Could not delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={inviteForm.handleSubmit(handleInvite)}
        className="space-y-3 rounded-xl border bg-background p-4"
      >
        <h3 className="text-lg font-semibold">Invite user</h3>
        <Input placeholder="Name" {...inviteForm.register("name")} />
        <Input placeholder="Email" {...inviteForm.register("email")} />
        <Input
          type="password"
          placeholder="Temporary password"
          {...inviteForm.register("password")}
        />
        <label className="text-sm text-muted-foreground">Role</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          {...inviteForm.register("role")}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Departments</p>
          <div className="grid gap-2 md:grid-cols-2">
            {departments.map((dept) => (
              <label key={dept.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={dept.id}
                  {...inviteForm.register("departmentIds")}
                />
                {dept.name}
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Invite user"}
        </Button>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border bg-background p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEditOpen(user)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {user.departments.map((dept) => (
                <span key={dept.department.id} className="rounded bg-muted px-2 py-1">
                  {dept.department.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditSave)}
            className="space-y-3"
          >
            <Input placeholder="Name" {...editForm.register("name")} />
            <label className="text-sm text-muted-foreground">Role</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              {...editForm.register("role")}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Departments</p>
              <div className="grid gap-2 md:grid-cols-2">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={dept.id}
                      {...editForm.register("departmentIds")}
                    />
                    {dept.name}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
