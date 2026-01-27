"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SectionShareLinkManager from "@/components/admin/SectionShareLinkManager";

type Department = { id: string; name: string };
type Section = { id: string; title: string; order: number; departmentId: string };
type Sop = {
  id: string;
  title: string;
  isPublished: boolean;
  order: number;
  sectionId: string | null;
  departmentId: string;
};

export default function SopsOrganizer({
  departments,
  sections: initialSections,
  sops: initialSops,
}: {
  departments: Department[];
  sections: Section[];
  sops: Sop[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [sops, setSops] = useState<Sop[]>(initialSops);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    departments[0]?.id ?? ""
  );
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [activeSop, setActiveSop] = useState<Sop | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [updatingSop, setUpdatingSop] = useState(false);

  const departmentSections = useMemo(
    () =>
      sections
        .filter((section) => section.departmentId === selectedDepartmentId)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [sections, selectedDepartmentId]
  );

  const departmentSops = useMemo(
    () => sops.filter((sop) => sop.departmentId === selectedDepartmentId),
    [sops, selectedDepartmentId]
  );

  const getSopsForSection = (sectionId: string | null) =>
    departmentSops
      .filter((sop) => sop.sectionId === sectionId)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const unassignedSops = getSopsForSection(null);

  const persistSectionOrder = async (ordered: Section[]) => {
    const res = await fetch("/api/sections/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: selectedDepartmentId,
        sections: ordered.map((section, index) => ({
          id: section.id,
          order: index,
        })),
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to reorder sections");
    }
  };

  const persistSopOrder = async (sectionId: string | null, ordered: Sop[]) => {
    const res = await fetch("/api/sops/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: selectedDepartmentId,
        sectionId,
        sops: ordered.map((sop, index) => ({
          id: sop.id,
          order: index,
        })),
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to reorder flows");
    }
  };

  const handleMoveSection = async (index: number, direction: number) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= departmentSections.length) return;
    const previous = sections;
    const reordered = [...departmentSections];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    const updated = reordered.map((section, idx) => ({
      ...section,
      order: idx,
    }));
    setSections((prev) =>
      prev.map((section) => {
        const next = updated.find((item) => item.id === section.id);
        return next ? { ...section, order: next.order } : section;
      })
    );

    try {
      await persistSectionOrder(updated);
      toast.success("Section order updated");
    } catch (error) {
      setSections(previous);
      toast.error("Could not reorder sections");
    }
  };

  const handleMoveSop = async (
    sectionId: string | null,
    index: number,
    direction: number
  ) => {
    const sectionSops = getSopsForSection(sectionId);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sectionSops.length) return;
    const previous = sops;
    const reordered = [...sectionSops];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    const updated = reordered.map((sop, idx) => ({
      ...sop,
      order: idx,
    }));
    setSops((prev) =>
      prev.map((sop) => {
        const next = updated.find((item) => item.id === sop.id);
        return next ? { ...sop, order: next.order } : sop;
      })
    );

    try {
      await persistSopOrder(sectionId, updated);
      toast.success("Flow order updated");
    } catch (error) {
      setSops(previous);
      toast.error("Could not reorder flows");
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    setSavingSection(true);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDepartmentId,
          title: newSectionTitle.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSections((prev) => [...prev, data.section]);
      setNewSectionTitle("");
      toast.success("Section created");
    } catch (error) {
      toast.error("Could not create section");
    } finally {
      setSavingSection(false);
    }
  };

  const openRenameSop = (sop: Sop) => {
    setActiveSop(sop);
    setRenameTitle(sop.title);
    setRenameOpen(true);
  };

  const openDeleteSop = (sop: Sop) => {
    setActiveSop(sop);
    setDeleteOpen(true);
  };

  const handleRenameSop = async () => {
    if (!activeSop || renameTitle.trim().length < 2) return;
    setUpdatingSop(true);
    try {
      const res = await fetch(`/api/sops/${activeSop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setSops((prev) =>
        prev.map((sop) =>
          sop.id === activeSop.id ? { ...sop, title: renameTitle.trim() } : sop
        )
      );
      toast.success("Flow renamed");
      setRenameOpen(false);
      setActiveSop(null);
    } catch {
      toast.error("Could not rename flow");
    } finally {
      setUpdatingSop(false);
    }
  };

  const handleDeleteSop = async () => {
    if (!activeSop) return;
    setUpdatingSop(true);
    try {
      const res = await fetch(`/api/sops/${activeSop.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setSops((prev) => prev.filter((sop) => sop.id !== activeSop.id));
      toast.success("Flow deleted");
      setDeleteOpen(false);
      setActiveSop(null);
    } catch {
      toast.error("Could not delete flow");
    } finally {
      setUpdatingSop(false);
    }
  };

  const renderSopActions = (sop: Sop) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openRenameSop(sop)}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openDeleteSop(sop)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const hasAnySops = departmentSops.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="text-sm">
          <span className="text-muted-foreground">Department</span>
          <select
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm md:w-72"
            value={selectedDepartmentId}
            onChange={(event) => setSelectedDepartmentId(event.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Input
            placeholder="New section name"
            value={newSectionTitle}
            onChange={(event) => setNewSectionTitle(event.target.value)}
          />
          <Button
            type="button"
            onClick={handleCreateSection}
            disabled={savingSection || !newSectionTitle.trim()}
          >
            {savingSection ? "Saving..." : "Add section"}
          </Button>
        </div>
      </div>

      {!departmentSections.length && !hasAnySops && (
        <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          No sections or flows yet for this department.
        </div>
      )}

      {departmentSections.map((section, sectionIndex) => {
        const sectionSops = getSopsForSection(section.id);
        return (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {sectionSops.length} flow{sectionSops.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleMoveSection(sectionIndex, -1)}
                  disabled={sectionIndex === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleMoveSection(sectionIndex, 1)}
                  disabled={sectionIndex === departmentSections.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SectionShareLinkManager sectionId={section.id} />

            <div className="space-y-2">
              {sectionSops.map((sop, sopIndex) => (
                <div
                  key={sop.id}
                  className="flex flex-col gap-2 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{sop.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {sop.isPublished ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveSop(section.id, sopIndex, -1)}
                      disabled={sopIndex === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMoveSop(section.id, sopIndex, 1)}
                      disabled={sopIndex === sectionSops.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  {renderSopActions(sop)}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/app/admin/sops/${sop.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/app/sop/${sop.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {!sectionSops.length && (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No flows in this section yet.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {unassignedSops.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">Unassigned</h3>
              <p className="text-xs text-muted-foreground">
                {unassignedSops.length} flow
                {unassignedSops.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {unassignedSops.map((sop, sopIndex) => (
              <div
                key={sop.id}
                className="flex flex-col gap-2 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{sop.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {sop.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMoveSop(null, sopIndex, -1)}
                    disabled={sopIndex === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMoveSop(null, sopIndex, 1)}
                    disabled={sopIndex === unassignedSops.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {renderSopActions(sop)}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/app/admin/sops/${sop.id}/edit`}>Edit</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/app/sop/${sop.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Flow name"
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleRenameSop}
                disabled={renameTitle.trim().length < 2 || updatingSop}
              >
                {updatingSop ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              This will permanently delete{" "}
              <span className="font-semibold">{activeSop?.title}</span>.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSop} disabled={updatingSop}>
                {updatingSop ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
