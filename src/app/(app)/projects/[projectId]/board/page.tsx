"use client";

import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  PriorityBadge,
  Skeleton,
  StatusBadge,
  TypeBadge,
  Avatar,
} from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { statusLabels, statusOrder } from "@/lib/utils/labels";
import type { Issue, IssueStatus } from "@/types";

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Issue>();
  const filters = {
    per_page: 100,
    sort: "updated_at" as const,
    order: "desc" as const,
  };
  const query = useQuery({
    queryKey: queryKeys.issues.list(projectId, filters),
    queryFn: () => resources.issues(projectId, filters),
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const move = useMutation({
    mutationFn: ({
      issueId,
      status,
      position,
    }: {
      issueId: string;
      status: IssueStatus;
      position: number;
    }) => resources.updatePosition(projectId, issueId, position, status),
    onMutate: async ({ issueId, status, position }) => {
      await client.cancelQueries({
        queryKey: queryKeys.issues.list(projectId, filters),
      });
      const key = queryKeys.issues.list(projectId, filters);
      const previous = client.getQueryData<{
        data: Issue[];
        meta: import("@/types").PageMeta;
      }>(key);
      if (previous)
        client.setQueryData(key, {
          ...previous,
          data: previous.data.map((item) =>
            item.id === issueId ? { ...item, status, position } : item,
          ),
        });
      return { previous, key };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(context.key, context.previous);
    },
    onSettled: () =>
      client.invalidateQueries({ queryKey: ["issues", projectId] }),
  });
  const issues = (query.data?.data ?? []).filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.identifier.toLowerCase().includes(search.toLowerCase()),
  );
  const onDragStart = ({ active }: DragStartEvent) =>
    setActive(issues.find((issue) => issue.id === String(active.id)));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActive(undefined);
    if (!over) return;
    const issue = issues.find((item) => item.id === String(active.id));
    if (!issue) return;
    const overIssue = issues.find((item) => item.id === String(over.id));
    const nextStatus = (
      statusOrder.includes(String(over.id) as IssueStatus)
        ? String(over.id)
        : overIssue?.status
    ) as IssueStatus;
    if (!nextStatus) return;
    const sameColumn = issues
      .filter((item) => item.status === nextStatus)
      .sort((a, b) => a.position - b.position);
    const nextPosition = overIssue
      ? overIssue.position
      : (sameColumn.at(-1)?.position ?? 0) + 1;
    if (issue.status !== nextStatus || issue.position !== nextPosition)
      move.mutate({
        issueId: issue.id,
        status: nextStatus,
        position: nextPosition,
      });
  };
  if (query.isLoading) return <BoardSkeleton />;
  return (
    <>
      <PageHeader
        eyebrow="Board"
        title="Board"
        description="Move an issue to update its status. Changes save when you drop it."
        action={
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-52 pl-9"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search this board"
              aria-label="Search board"
            />
          </div>
        }
      />
      {query.error ? (
        <ErrorState
          message="We couldn't load the board."
          onRetry={() => query.refetch()}
        />
      ) : !issues.length ? (
        <EmptyState
          title="No issues on the board"
          description="Create an issue or clear your search to see work here."
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex min-h-[calc(100vh-220px)] gap-3 overflow-x-auto pb-3">
            {statusOrder.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                issues={issues
                  .filter((issue) => issue.status === status)
                  .sort((a, b) => a.position - b.position)}
                projectId={projectId}
              />
            ))}
          </div>
          <DragOverlay>
            {active ? (
              <IssueCard issue={active} projectId={projectId} overlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );
}

function BoardColumn({
  status,
  issues,
  projectId,
}: {
  status: IssueStatus;
  issues: Issue[];
  projectId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`w-[280px] shrink-0 rounded-xl border p-3 transition ${isOver ? "border-primary bg-primary/5" : "border-border bg-muted/45"}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${status === "done" ? "bg-emerald-500" : status === "in_progress" ? "bg-amber-500" : status === "cancelled" ? "bg-rose-500" : "bg-slate-400"}`}
          />
          <h2 className="text-sm font-semibold">{statusLabels[status]}</h2>
          <span className="text-xs text-muted-foreground">{issues.length}</span>
        </div>
        <button
          aria-label={`Add issue to ${statusLabels[status]}`}
          className="rounded p-1 text-muted-foreground hover:bg-surface"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <SortableContext
        items={issues.map((issue) => issue.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-24 space-y-2">
          {issues.map((issue) => (
            <SortableIssue key={issue.id} issue={issue} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
function SortableIssue({
  issue,
  projectId,
}: {
  issue: Issue;
  projectId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-40" : ""}
    >
      <IssueCard issue={issue} projectId={projectId} />
    </div>
  );
}
function IssueCard({
  issue,
  projectId,
  overlay,
}: {
  issue: Issue;
  projectId: string;
  overlay?: boolean;
}) {
  return (
    <Link
      href={`/projects/${projectId}/issues/${issue.id}`}
      onClick={(e) => overlay && e.preventDefault()}
      className={`block rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-primary/50 hover:shadow-soft ${overlay ? "rotate-2 shadow-xl" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold text-primary">
          {issue.identifier}
        </span>
        <TypeBadge type={issue.type} />
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-5">
        {issue.title}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={issue.priority} />
        {issue.assignee ? (
          <Avatar user={issue.assignee} size="sm" />
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
      </div>
    </Link>
  );
}
function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[500px] w-[280px] shrink-0" />
      ))}
    </div>
  );
}
