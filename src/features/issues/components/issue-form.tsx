"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { issueSchema, type IssueInput } from "@/lib/validation/schemas";
import type { Issue, IssueStatus } from "@/types";

export function IssueForm({
  projectId,
  issue,
  initialStatus,
  onClose,
  onSaved,
}: {
  projectId: string;
  issue?: Issue;
  initialStatus?: IssueStatus;
  onClose: () => void;
  onSaved?: (issue: Issue) => void;
}) {
  const client = useQueryClient();
  const members = useQuery({
    queryKey: queryKeys.members.list(projectId),
    queryFn: () => resources.members(projectId),
  });
  const form = useForm<IssueInput>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: issue?.title ?? "",
      description: issue?.description ?? "",
      type: issue?.type ?? "task",
      status: issue?.status ?? initialStatus ?? "todo",
      priority: issue?.priority ?? "medium",
      assignee_id: issue?.assignee_id ?? null,
      due_date: issue?.due_date?.slice(0, 10) ?? null,
    },
  });
  const mutation = useMutation({
    mutationFn: (data: IssueInput) =>
      issue
        ? resources.updateIssue(projectId, issue.id, data)
        : resources.createIssue(projectId, data),
    onSuccess: async (saved) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["issues", projectId] }),
        client.invalidateQueries({ queryKey: queryKeys.dashboard(projectId) }),
        client.invalidateQueries({
          queryKey: queryKeys.issues.detail(projectId, saved.id),
        }),
      ]);
      onSaved?.(saved);
      onClose();
    },
  });
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-end bg-slate-950/35 sm:p-4"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="max-h-[94vh] w-full overflow-y-auto border-border bg-surface p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:border sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-form-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {issue ? "Edit issue" : "New issue"}
            </p>
            <h2 id="issue-form-title" className="mt-1 text-xl font-semibold">
              {issue ? issue.identifier : "Add an issue"}
            </h2>
          </div>
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close issue form"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          noValidate
        >
          <div>
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              autoFocus
              placeholder="Summarize the work"
              {...form.register("title")}
            />
            <FieldError>{form.formState.errors.title?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="issue-description">
              Description{" "}
              <span className="normal-case font-normal tracking-normal">
                (Markdown-friendly)
              </span>
            </Label>
            <Textarea
              id="issue-description"
              placeholder="Add context, acceptance criteria, or useful links..."
              {...form.register("description")}
            />
            <FieldError>
              {form.formState.errors.description?.message}
            </FieldError>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="issue-type">Type</Label>
              <Select id="issue-type" {...form.register("type")}>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="issue-status">Status</Label>
              <Select id="issue-status" {...form.register("status")}>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="issue-priority">Priority</Label>
              <Select id="issue-priority" {...form.register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="issue-assignee">Assignee</Label>
              <Select
                id="issue-assignee"
                {...form.register("assignee_id", {
                  setValueAs: (value) => value || null,
                })}
              >
                <option value="">Unassigned</option>
                {members.data?.data.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="issue-due-date">Due date</Label>
              <Input
                id="issue-due-date"
                type="date"
                {...form.register("due_date", {
                  setValueAs: (value) => value || null,
                })}
              />
              <FieldError>{form.formState.errors.due_date?.message}</FieldError>
            </div>
          </div>
          {mutation.error && (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
              role="alert"
            >
              Unable to save this issue. Check the fields and try again.
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {issue ? "Save changes" : "Create issue"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
