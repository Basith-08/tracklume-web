"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserRoundX } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FieldError,
  Input,
  Label,
  Select,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/client";
import { canManageMembers } from "@/lib/auth/permissions";
import { memberSchema } from "@/lib/validation/schemas";
import { formatDate } from "@/lib/utils/date";
import { roleLabels } from "@/lib/utils/labels";
import type { ProjectMember, ProjectRole } from "@/types";

export default function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const client = useQueryClient();
  const [remove, setRemove] = useState<ProjectMember>();
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => resources.project(projectId),
  });
  const members = useQuery({
    queryKey: queryKeys.members.list(projectId),
    queryFn: () => resources.members(projectId),
  });
  const add = useMutation({
    mutationFn: (body: { email: string; role: string }) =>
      resources.addMember(projectId, body),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.members.list(projectId) });
      form.reset();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      resources.updateMember(projectId, id, role),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.members.list(projectId) }),
  });
  const removeMutation = useMutation({
    mutationFn: (id: string) => resources.removeMember(projectId, id),
    onSuccess: () => {
      setRemove(undefined);
      client.invalidateQueries({ queryKey: queryKeys.members.list(projectId) });
    },
  });
  const form = useForm<{ email: string; role: "admin" | "member" | "viewer" }>({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: "", role: "member" },
  });
  const canManage = project.data
    ? canManageMembers(project.data.current_user_role)
    : false;
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Members"
        description="Control who can see and move work in this project."
      />
      {canManage && (
        <form
          className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end"
          onSubmit={form.handleSubmit((data) => add.mutate(data))}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="member-email">Add by email</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="teammate@company.com"
              {...form.register("email")}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </div>
          <div className="sm:w-36">
            <Label htmlFor="member-role">Role</Label>
            <Select id="member-role" {...form.register("role")}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </Select>
          </div>
          <Button type="submit" loading={add.isPending}>
            <UserPlus className="h-4 w-4" />
            Add member
          </Button>
          {add.error && (
            <p className="text-xs text-destructive sm:col-span-3" role="alert">
              {add.error instanceof ApiError && add.error.status === 404
                ? "User not found. Ask them to create an account first."
                : "We couldn't add this member. Check the email and try again."}
            </p>
          )}
        </form>
      )}
      {members.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : members.error ? (
        <ErrorState
          message="We couldn't load the project members."
          onRetry={() => members.refetch()}
        />
      ) : !members.data?.data.length ? (
        <EmptyState
          icon={UserPlus}
          title="No members yet"
          description="Add teammates by their registered email address."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {members.data.data.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 border-b border-border p-4 last:border-0 sm:flex-row sm:items-center"
            >
              <Avatar user={member} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {member.joined_at
                  ? `Joined ${formatDate(member.joined_at)}`
                  : ""}
              </span>
              {canManage && member.role !== "owner" ? (
                <div className="flex items-center gap-2">
                  <Select
                    aria-label={`Role for ${member.name}`}
                    value={member.role}
                    onChange={(e) =>
                      update.mutate({ id: member.id, role: e.target.value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${member.name}`}
                    onClick={() => setRemove(member)}
                  >
                    <UserRoundX className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                  {roleLabels[member.role]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(remove)}
        title={`Remove ${remove?.name}?`}
        description="They will immediately lose access to this project. You can add them again later."
        onClose={() => setRemove(undefined)}
        onConfirm={() => remove && removeMutation.mutate(remove.id)}
        loading={removeMutation.isPending}
        confirmLabel="Remove member"
      />
    </>
  );
}
