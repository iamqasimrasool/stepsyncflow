"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import dynamic from "next/dynamic";
import { Link2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

type SopItem = {
  id: string;
  title: string;
  summary?: string | null;
  departmentName?: string | null;
};

type BoardElement = {
  id?: string;
  type?: string;
  isDeleted?: boolean;
  link?: string;
} & Record<string, unknown>;

type BoardFiles = Record<string, unknown>;

type FlowBoardCanvasProps = {
  boardId: string;
  boardName: string;
  initialElements: BoardElement[];
  initialAppState: Record<string, unknown> | null;
  initialFiles: BoardFiles | null;
  initialUpdatedAt?: string | null;
  sops: SopItem[];
};

const linkableTypes = new Set(["rectangle", "diamond", "ellipse", "text", "stickyNote"]);

export default function FlowBoardCanvas({
  boardId,
  boardName,
  initialElements,
  initialAppState,
  initialFiles,
  initialUpdatedAt,
  sops,
}: FlowBoardCanvasProps) {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(
    null
  );
  const elementsRef = useRef<BoardElement[]>(initialElements);
  const appStateRef = useRef<Record<string, unknown> | null>(initialAppState);
  const filesRef = useRef<BoardFiles | null>(initialFiles);
  const [selectedElementIds, setSelectedElementIds] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(initialUpdatedAt ?? null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const initialized = useRef(false);
  const selectedElementIdsRef = useRef<Record<string, boolean>>({});

  const initialData = useMemo<ExcalidrawInitialDataState>(
    () => ({
      elements: initialElements as unknown as ExcalidrawInitialDataState["elements"],
      appState: {
        ...(initialAppState ?? {}),
        gridModeEnabled: true,
      },
      files: initialFiles
        ? (initialFiles as unknown as BinaryFiles)
        : undefined,
    }),
    [initialAppState, initialElements, initialFiles]
  );

  const selectedElement = useMemo(() => {
    const selectedId = Object.keys(selectedElementIds).find(
      (key) => selectedElementIds[key]
    );
    if (!selectedId) return null;
    return elementsRef.current.find((element) => element.id === selectedId) ?? null;
  }, [selectedElementIds]);

  const selectedType = selectedElement?.type;
  const canLinkSelected =
    !!selectedType && linkableTypes.has(selectedType) && !selectedElement?.isDeleted;

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/flow-boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements: elementsRef.current,
          appState: appStateRef.current,
          files: filesRef.current,
        }),
      });
      if (!response.ok) {
        throw new Error("Save failed");
      }
      setDirty(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Board saved");
    } catch {
      toast.error("Could not save board");
    } finally {
      setIsSaving(false);
    }
  }, [boardId]);

  const handleLinkApply = useCallback(
    (sopId: string) => {
      if (!selectedElement) return;
      const link = `/app/sop/${sopId}`;
      const updatedElements = elementsRef.current.map((element) =>
        element.id === selectedElement.id ? { ...element, link } : element
      );
      excalidrawApi?.updateScene({
        elements:
          updatedElements as unknown as ExcalidrawInitialDataState["elements"],
      });
      setLinkModalOpen(false);
      setLinkSearch("");
      toast.success("Workflow linked");
    },
    [excalidrawApi, selectedElement]
  );

  const filteredSops = useMemo(() => {
    const query = linkSearch.trim().toLowerCase();
    if (!query) return sops;
    return sops.filter(
      (sop) =>
        sop.title.toLowerCase().includes(query) ||
        sop.summary?.toLowerCase().includes(query) ||
        sop.departmentName?.toLowerCase().includes(query)
    );
  }, [linkSearch, sops]);

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[640px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Flow board</p>
          <h2 className="text-2xl font-semibold">{boardName}</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastSavedAt ? (
            <span className="text-xs text-muted-foreground">
              Last saved {new Date(lastSavedAt).toLocaleString()}
            </span>
          ) : null}
          <Button onClick={handleSave} disabled={isSaving || !dirty}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-hidden rounded-xl border bg-background">
          <Excalidraw
            initialData={initialData}
            excalidrawAPI={(api) => setExcalidrawApi((prev) => prev ?? api)}
            onChange={(nextElements, nextAppState, nextFiles) => {
              elementsRef.current = [...nextElements] as unknown as BoardElement[];
              appStateRef.current = {
                gridModeEnabled: nextAppState.gridModeEnabled,
                viewBackgroundColor: nextAppState.viewBackgroundColor,
                scrollX: nextAppState.scrollX,
                scrollY: nextAppState.scrollY,
                zoom: nextAppState.zoom,
                theme: nextAppState.theme,
              };
              filesRef.current = nextFiles as Record<string, unknown>;
              const nextSelected = nextAppState.selectedElementIds ?? {};
              const prevSelected = selectedElementIdsRef.current;
              const selectionChanged =
                Object.keys(nextSelected).length !==
                  Object.keys(prevSelected).length ||
                Object.keys(nextSelected).some((key) => !prevSelected[key]);
              if (selectionChanged) {
                selectedElementIdsRef.current = nextSelected;
                setSelectedElementIds(nextSelected);
              }
              if (initialized.current) {
                setDirty(true);
              } else {
                initialized.current = true;
              }
            }}
            onLinkOpen={(element) => {
              if (element.link) {
                window.open(element.link, "_blank", "noreferrer");
              }
            }}
          />

          {canLinkSelected ? (
            <div className="absolute right-4 top-4 z-20 rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLinkModalOpen(true)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Link workflow
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link a workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search workflows"
              value={linkSearch}
              onChange={(event) => setLinkSearch(event.target.value)}
            />
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {filteredSops.map((sop) => (
                <button
                  key={sop.id}
                  type="button"
                  onClick={() => handleLinkApply(sop.id)}
                  className="flex w-full flex-col rounded-lg border px-3 py-2 text-left transition hover:bg-muted"
                >
                  <span className="text-sm font-medium">{sop.title}</span>
                  {sop.departmentName ? (
                    <span className="text-xs text-muted-foreground">
                      {sop.departmentName}
                    </span>
                  ) : null}
                </button>
              ))}
              {!filteredSops.length ? (
                <p className="text-sm text-muted-foreground">
                  No workflows match that search.
                </p>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
