"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShareLink = {
  token: string;
  enabled: boolean;
  hasPassword: boolean;
};

export default function SectionShareLinkManager({
  sectionId,
}: {
  sectionId: string;
}) {
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");

  const shareUrl = useMemo(() => {
    if (!shareLink) return "";
    return `${window.location.origin}/share/section/${shareLink.token}`;
  }, [shareLink]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sections/${sectionId}/share`);
        if (res.status === 404) {
          setShareLink(null);
          return;
        }
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setShareLink(data.shareLink);
      } catch (error) {
        toast.error("Could not load section share link");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sectionId]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${sectionId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setShareLink(data.shareLink);
      toast.success("Section link created");
    } catch (error) {
      toast.error("Could not create section link");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (!shareLink) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${sectionId}/share`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setShareLink(data.shareLink);
      toast.success("Section link updated");
    } catch (error) {
      toast.error("Could not update section link");
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${sectionId}/share/rotate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setShareLink(data.shareLink);
      toast.success("Link rotated");
    } catch (error) {
      toast.error("Could not rotate link");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (nextPassword: string | null) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${sectionId}/share`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setShareLink(data.shareLink);
      setPassword("");
      toast.success("Password updated");
    } catch (error) {
      toast.error("Could not update password");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch (error) {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Public section link</p>
        <p className="text-xs text-muted-foreground">
          Share all published flows in this section.
        </p>
      </div>

      {loading ? (
        <p className="mt-3 text-xs text-muted-foreground">Loading link...</p>
      ) : !shareLink ? (
        <Button
          type="button"
          size="sm"
          className="mt-3"
          onClick={handleCreate}
          disabled={saving}
        >
          {saving ? "Creating..." : "Create link"}
        </Button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Share URL</p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input value={shareUrl} readOnly />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
                  Copy
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={handleRotate} disabled={saving}>
                  Rotate
                </Button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={shareLink.enabled}
              onChange={(event) => handleToggle(event.target.checked)}
              disabled={saving}
            />
            Enable public link
          </label>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {shareLink.hasPassword
                ? "Password is set for this link."
                : "No password is set."}
            </p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                type="password"
                placeholder="Set or update password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handlePasswordSave(password.trim() || null)}
                  disabled={saving || !password.trim()}
                >
                  Save password
                </Button>
                {shareLink.hasPassword && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handlePasswordSave(null)}
                    disabled={saving}
                  >
                    Remove password
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
