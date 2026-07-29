"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button, FieldError, Input, Label, Textarea } from "@/components/ui";
import { resources } from "@/lib/api/resources";
import { queryKeys } from "@/lib/api/queries";
import { projectSchema, type ProjectInput } from "@/lib/validation/schemas";
import type { Project } from "@/types";

export function ProjectForm({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      key: project?.key ?? "",
      description: project?.description ?? "",
    },
  });
  const mutation = useMutation({
    mutationFn: (data: ProjectInput) =>
      project
        ? resources.updateProject(project.id, {
            name: data.name,
            description: data.description,
          })
        : resources.createProject({ ...data, key: data.key.toUpperCase() }),
    onSuccess: async (saved) => {
      await client.invalidateQueries({ queryKey: queryKeys.projects.list() });
      if (!project) window.location.href = `/projects/${saved.id}`;
      else onClose();
    },
  });
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-end bg-slate-950/35 sm:items-center sm:justify-center sm:p-4"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="w-full border-border bg-surface p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {project ? "Project settings" : "New project"}
            </p>
            <h2 id="project-form-title" className="mt-1 text-xl font-semibold">
              {project ? "Edit project" : "Create a project"}
            </h2>
          </div>
          <button
            aria-label="Close project form"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
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
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              autoFocus
              placeholder="Website refresh"
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="project-key">Key</Label>
            <Input
              id="project-key"
              maxLength={8}
              placeholder="WEB"
              disabled={Boolean(project)}
              {...form.register("key", {
                onChange: (event) => {
                  event.target.value = event.target.value.toUpperCase();
                },
              })}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {project ? (
                "Project keys cannot be changed by the current backend contract."
              ) : (
                <>
                  Issues will look like{" "}
                  <span className="font-semibold text-foreground">
                    {(form.watch("key") || "WEB").toUpperCase()}-1
                  </span>
                  .
                </>
              )}
            </p>
            <FieldError>{form.formState.errors.key?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project responsible for?"
              {...form.register("description")}
            />
            <FieldError>
              {form.formState.errors.description?.message}
            </FieldError>
          </div>
          {mutation.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Unable to save project. Please check the values and try again.
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {project ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
