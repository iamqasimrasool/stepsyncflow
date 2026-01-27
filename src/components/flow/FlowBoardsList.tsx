"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type FlowBoardSummary = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
};

type FlowBoardsListProps = {
  boards: FlowBoardSummary[];
};

export default function FlowBoardsList({ boards }: FlowBoardsListProps) {
  const [items, setItems] = useState(boards);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<FlowBoardSummary | null>(null);
  const [boardName, setBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const sortedBoards = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [items]
  );

  const handleCreate = async () => {
    if (!boardName.trim()) return;
    setIsCreating(true);
    try {
      const response = await fetch("/api/flow-boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boardName.trim() }),
      });
      if (!response.ok) {
        throw new Error("Create failed");
      }
      const payload = (await response.json()) as { board: FlowBoardSummary };
      setItems((prev) => [payload.board, ...prev]);
      setBoardName("");
      setCreateOpen(false);
      router.push(`/app/flow-boards/${payload.board.id}`);
    } catch {
      toast.error("Could not create board");
      setIsCreating(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openRename = (board: FlowBoardSummary) => {
    setActiveBoard(board);
    setBoardName(board.name);
    setRenameOpen(true);
  };

  const openDelete = (board: FlowBoardSummary) => {
    setActiveBoard(board);
    setDeleteOpen(true);
  };

  const handleRename = async () => {
    if (!activeBoard || !boardName.trim()) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/flow-boards/${activeBoard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boardName.trim() }),
      });
      if (!response.ok) {
        throw new Error("Rename failed");
      }
      setItems((prev) =>
        prev.map((board) =>
          board.id === activeBoard.id ? { ...board, name: boardName.trim() } : board
        )
      );
      setRenameOpen(false);
      setActiveBoard(null);
      toast.success("Board renamed");
    } catch {
      toast.error("Could not rename board");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeBoard) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/flow-boards/${activeBoard.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      setItems((prev) => prev.filter((board) => board.id !== activeBoard.id));
      setDeleteOpen(false);
      setActiveBoard(null);
      toast.success("Board deleted");
    } catch {
      toast.error("Could not delete board");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Boards</h2>
            <p className="text-sm text-muted-foreground">
              Create and manage your flow boards.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBoards.map((board) => (
            <div
              key={board.id}
              className="group rounded-xl border bg-background p-4 transition hover:border-primary/60 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/app/flow-boards/${board.id}`} className="flex-1">
                  <div className="flex h-32 flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold">{board.name}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated {new Date(board.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(board.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRename(board)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDelete(board)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {!sortedBoards.length ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No boards yet. Create your first one to get started.
            </div>
          ) : null}
        </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Board name"
              value={boardName}
              onChange={(event) => setBoardName(event.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={!boardName.trim() || isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Board name"
              value={boardName}
              onChange={(event) => setBoardName(event.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleRename} disabled={!boardName.trim() || isUpdating}>
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              This will permanently delete{" "}
              <span className="font-semibold">{activeBoard?.name}</span>.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isUpdating}>
                {isUpdating ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
