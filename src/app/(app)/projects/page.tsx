"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowUpRight,
  FolderKanban,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { roleLabels } from "@/lib/utils/labels";
import { ProjectForm } from "@/features/projects/components/project-form";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project>();
  const [deleting, setDeleting] = useState<Project>();
  const client = useQueryClient();
  const me = useQuery({ queryKey: queryKeys.me(), queryFn: resources.me });
  const projects = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: resources.projects,
  });
  const remove = useMutation({
    mutationFn: (id: string) => resources.deleteProject(id),
    onSuccess: () => {
      setDeleting(undefined);
      client.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
  if (me.isLoading || projects.isLoading)
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  if (!me.data) return null;
  return (
    <AppShell user={me.data}>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="A clear starting point for every piece of work."
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />
      {projects.error ? (
        <ErrorState
          message="We couldn't load your projects."
          onRetry={() => projects.refetch()}
        />
      ) : projects.data?.data.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your workspace is ready"
          description="Create your first project to start tracking work with your team."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.data?.data.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setEditing(project);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}
      {formOpen && (
        <ProjectForm project={editing} onClose={() => setFormOpen(false)} />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Archive ${deleting?.name}?`}
        description="This archives the project and keeps its issues and activity history in the backend."
        onClose={() => setDeleting(undefined)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        loading={remove.isPending}
      />
    </AppShell>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <article className="group relative rounded-xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
      <div className="mb-8 flex items-start justify-between">
        <Link
          href={`/projects/${project.id}`}
          className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary"
        >
          {project.key.slice(0, 3)}
        </Link>
        <div className="relative">
          <button
            aria-label={`Actions for ${project.name}`}
            className="rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100"
            onClick={() => setMenu(!menu)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-10 w-36 rounded-lg border border-border bg-surface p-1 shadow-soft">
              <button
                onClick={onEdit}
                className="block w-full rounded px-2 py-2 text-left text-xs hover:bg-muted"
              >
                Edit project
              </button>
              <button
                onClick={onDelete}
                className="block w-full rounded px-2 py-2 text-left text-xs text-destructive hover:bg-destructive/10"
              >
                Archive project
              </button>
            </div>
          )}
        </div>
      </div>
      <Link href={`/projects/${project.id}`}>
        <h2 className="flex items-center gap-2 font-semibold group-hover:text-primary">
          {project.name}
          <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
        </h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {project.description || "No description yet."}
        </p>
      </Link>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {project.is_archived ? (
            <Archive className="h-3.5 w-3.5" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          {project.is_archived
            ? "Archived"
            : `${project.issue_count ?? 0} issues`}
        </span>
        <span className="rounded bg-muted px-2 py-1 font-medium">
          {roleLabels[project.current_user_role]}
        </span>
      </div>
    </article>
  );
}
