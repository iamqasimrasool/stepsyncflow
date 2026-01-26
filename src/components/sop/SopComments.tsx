"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Link2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentAuthor = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
};

type SopComment = {
  id: string;
  body: string;
  timestamp: number;
  parentId: string | null;
  editedAt: string | null;
  createdAt: string;
  author: CommentAuthor;
  edits?: { id: string; body: string; editedAt: string }[];
};

function formatTimestamp(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SopComments({
  sopId,
  getCurrentTime,
  onSeek,
  listVisible = true,
  onToggleList,
}: {
  sopId: string;
  getCurrentTime: () => number;
  onSeek: (seconds: number) => void;
  listVisible?: boolean;
  onToggleList?: () => void;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;
  const pathname = usePathname();
  const [comments, setComments] = useState<SopComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedEdits, setExpandedEdits] = useState<Record<string, boolean>>({});
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sops/${sopId}/comments`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setComments(data.comments ?? []);
      } catch (error) {
        toast.error("Could not load comments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sopId]);

  useEffect(() => {
    if (!replyingId) return;
    replyRef.current?.focus();
  }, [replyingId]);

  const rootComments = useMemo(
    () =>
      comments.filter((comment) => !comment.parentId).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      ),
    [comments]
  );

  const repliesByParent = useMemo(() => {
    const map = new Map<string, SopComment[]>();
    comments.forEach((comment) => {
      if (!comment.parentId) return;
      const list = map.get(comment.parentId) ?? [];
      list.push(comment);
      map.set(comment.parentId, list);
    });
    map.forEach((list) =>
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    );
    return map;
  }, [comments]);

  const handleCreate = async (parentId?: string | null) => {
    const body = (parentId ? replyBody : newBody).trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sops/${sopId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          parentId: parentId ?? null,
          timestamp: Math.floor(getCurrentTime()),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      if (parentId) {
        setReplyBody("");
        setReplyingId(null);
      } else {
        setNewBody("");
      }
      toast.success("Comment added");
    } catch (error) {
      toast.error("Could not add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    const body = editingBody.trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sops/${sopId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? data.comment : comment
        )
      );
      setEditingId(null);
      setEditingBody("");
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Could not update comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async (commentId: string) => {
    try {
      const base = window.location.origin;
      const link = `${base}${pathname}#comment-${commentId}`;
      await navigator.clipboard.writeText(link);
      toast.success("Comment link copied");
    } catch (error) {
      toast.error("Could not copy link");
    }
  };

  const getInitials = (author: CommentAuthor) => {
    const base = author.name?.trim() || author.email;
    return base
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const Avatar = ({ author }: { author: CommentAuthor }) => (
    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold text-muted-foreground">
      {author.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.avatarUrl}
          alt={author.name ?? author.email}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(author)}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/60 bg-white/80 p-4 soft-shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
          <span className="text-xs text-muted-foreground">
            {comments.length} total
          </span>
        </div>
        <div className="mt-2 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            rows={2}
            value={newBody}
            onChange={(event) => setNewBody(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                handleCreate(null);
              }
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Timestamp: {formatTimestamp(Math.floor(getCurrentTime()))}</span>
            <Button
              type="button"
              size="sm"
              onClick={() => handleCreate(null)}
              disabled={submitting || !newBody.trim()}
            >
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>

      {onToggleList && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
            onClick={onToggleList}
          >
            {listVisible ? "Hide comments" : "View comments"}
          </button>
        </div>
      )}

      {loading && listVisible && (
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-muted-foreground soft-shadow">
          Loading comments...
        </div>
      )}

      {!loading && !comments.length && listVisible && (
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-muted-foreground soft-shadow">
          No comments yet. Be the first to add one.
        </div>
      )}

      {listVisible && (
        <div className="space-y-3">
          {rootComments.map((comment) => {
            const replies = repliesByParent.get(comment.id) ?? [];
            const isOwner = currentUserId === comment.author.id;
            const isExpanded = expandedReplies[comment.id] ?? false;
            return (
              <div
                key={comment.id}
                id={`comment-${comment.id}`}
                className="space-y-3 rounded-2xl border border-white/60 bg-white/80 p-4 soft-shadow transition hover:-translate-y-0.5 hover:border-slate-200"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Avatar author={comment.author} />
                  <div>
                    <p className="text-sm font-semibold">
                      {comment.author.name ?? comment.author.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <button
                        type="button"
                        className="underline-offset-2 hover:underline"
                        onClick={() => onSeek(comment.timestamp)}
                      >
                        {formatTimestamp(comment.timestamp)}
                      </button>
                      <span>{formatDateTime(comment.createdAt)}</span>
                      {comment.editedAt && (
                        <button
                          type="button"
                          className="underline-offset-2 hover:underline"
                          onClick={() =>
                            setExpandedEdits((prev) => ({
                              ...prev,
                              [comment.id]: !prev[comment.id],
                            }))
                          }
                        >
                          Edited
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isOwner && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingBody(comment.body);
                      }}
                      aria-label="Edit comment"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyLink(comment.id)}
                    aria-label="Copy comment link"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    value={editingBody}
                    onChange={(event) => setEditingBody(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={submitting || !editingBody.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditingBody("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{comment.body}</p>
              )}

              {expandedEdits[comment.id] && comment.edits?.length ? (
                <div className="space-y-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  {comment.edits.map((edit) => (
                    <div key={edit.id}>
                      <p className="text-xs">{formatDateTime(edit.editedAt)}</p>
                      <p>{edit.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    setExpandedReplies((prev) => ({
                      ...prev,
                      [comment.id]: true,
                    }));
                    setReplyingId((prev) =>
                      prev === comment.id ? null : comment.id
                    );
                  }}
                >
                  Reply
                </button>
                {replies.length > 0 && (
                  <button
                    type="button"
                    className="underline-offset-2 hover:underline"
                    onClick={() =>
                      setExpandedReplies((prev) => ({
                        ...prev,
                        [comment.id]: !isExpanded,
                      }))
                    }
                  >
                    {isExpanded
                      ? "Hide replies"
                      : `Show replies (${replies.length})`}
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="space-y-2">
                  {replyingId === comment.id && (
                    <div className="space-y-2 rounded-lg border border-dashed p-3">
                      <Textarea
                        rows={2}
                        placeholder="Write a reply..."
                        ref={replyRef}
                        value={replyBody}
                        onChange={(event) => setReplyBody(event.target.value)}
                        onKeyDown={(event) => {
                          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                            event.preventDefault();
                            handleCreate(comment.id);
                          }
                        }}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Timestamp: {formatTimestamp(Math.floor(getCurrentTime()))}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCreate(comment.id)}
                          disabled={submitting || !replyBody.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div className="space-y-2">
                      {replies.map((reply) => {
                        const replyOwner = currentUserId === reply.author.id;
                        const isEditing = editingId === reply.id;
                        return (
                          <div
                            key={reply.id}
                            id={`comment-${reply.id}`}
                            className="space-y-3 rounded-2xl border border-white/60 bg-white/80 p-4 soft-shadow transition hover:-translate-y-0.5 hover:border-slate-200"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex gap-3">
                                <Avatar author={reply.author} />
                                <div>
                                  <p className="text-sm font-semibold">
                                    {reply.author.name ?? reply.author.email}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <button
                                      type="button"
                                      className="underline-offset-2 hover:underline"
                                      onClick={() => onSeek(reply.timestamp)}
                                    >
                                      {formatTimestamp(reply.timestamp)}
                                    </button>
                                    <span>{formatDateTime(reply.createdAt)}</span>
                                    {reply.editedAt && (
                                      <button
                                        type="button"
                                        className="underline-offset-2 hover:underline"
                                        onClick={() =>
                                          setExpandedEdits((prev) => ({
                                            ...prev,
                                            [reply.id]: !prev[reply.id],
                                          }))
                                        }
                                      >
                                        Edited
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {replyOwner && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingId(reply.id);
                                      setEditingBody(reply.body);
                                    }}
                                    aria-label="Edit reply"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCopyLink(reply.id)}
                                  aria-label="Copy reply link"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  rows={2}
                                  value={editingBody}
                                  onChange={(event) =>
                                    setEditingBody(event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                                      event.preventDefault();
                                      handleEdit(reply.id);
                                    }
                                  }}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleEdit(reply.id)}
                                    disabled={submitting || !editingBody.trim()}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditingBody("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {reply.body}
                              </p>
                            )}
                            {expandedEdits[reply.id] && reply.edits?.length ? (
                              <div className="space-y-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                {reply.edits.map((edit) => (
                                  <div key={edit.id}>
                                    <p className="text-xs">
                                      {formatDateTime(edit.editedAt)}
                                    </p>
                                    <p>{edit.body}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
