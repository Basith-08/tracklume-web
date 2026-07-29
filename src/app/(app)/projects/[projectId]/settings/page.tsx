"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ConfirmDialog, ErrorState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { ProjectForm } from "@/features/projects/components/project-form";
import { canManageProject } from "@/lib/auth/permissions";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => resources.project(projectId),
  });
  const remove = useMutation({
    mutationFn: () => resources.deleteProject(projectId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.list() });
      router.push("/projects");
    },
  });
  if (project.isLoading) return <Skeleton className="h-64" />;
  if (project.error || !project.data)
    return (
      <ErrorState
        message="We couldn't load project settings."
        onRetry={() => project.refetch()}
      />
    );
  const data = project.data;
  const canManage = canManageProject(data.current_user_role);
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Project settings"
        description="Keep project context and lifecycle state up to date."
        action={
          canManage && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit details
            </Button>
          )
        }
      />
      <div className="max-w-3xl space-y-6">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {data.key.slice(0, 3)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{data.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.key} · {data.description || "No description"}
              </p>
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
              {data.current_user_role}
            </span>
          </div>
        </section>
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h2 className="font-semibold">Danger zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The backend DELETE operation archives this project. It stays
                stored but leaves the active project list.
              </p>
              {canManage && (
                <Button
                  className="mt-4"
                  variant="danger"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Archive project
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
      {editing && (
        <ProjectForm project={data} onClose={() => setEditing(false)} />
      )}
      <ConfirmDialog
        open={deleting}
        title={`Archive ${data.name}?`}
        description="This archives the project and removes it from active workflows. The backend keeps its issues and activity history."
        onClose={() => setDeleting(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        confirmLabel="Archive project"
      />
    </>
  );
}
