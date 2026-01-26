"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Profile = {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
};

export default function ProfileForm({ initial }: { initial: Profile }) {
  const { update } = useSession();
  const [name, setName] = useState(initial.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      await update({
        name: data.profile.name,
        avatarUrl: data.profile.avatarUrl,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-semibold text-muted-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name || initial.email}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{(name || initial.email).slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm text-muted-foreground">Profile photo URL</label>
          <Input
            placeholder="https://example.com/avatar.png"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Email</label>
          <Input value={initial.email} readOnly />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
