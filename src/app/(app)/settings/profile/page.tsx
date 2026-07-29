"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, UserRound } from "lucide-react";
import { Button, FieldError, Input, Label, Avatar } from "@/components/ui";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-state";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { passwordSchema, profileSchema } from "@/lib/validation/schemas";

export default function ProfileSettingsPage() {
  const client = useQueryClient();
  const me = useQuery({ queryKey: queryKeys.me(), queryFn: resources.me });
  const profile = useForm<{ name: string; avatar_url: string }>({
    resolver: zodResolver(profileSchema),
  });
  const password = useForm<{
    current_password: string;
    new_password: string;
    confirm_password: string;
  }>({ resolver: zodResolver(passwordSchema) });
  const saveProfile = useMutation({
    mutationFn: resources.updateProfile,
    onSuccess: (user) => client.setQueryData(queryKeys.me(), user),
  });
  const savePassword = useMutation({
    mutationFn: resources.updatePassword,
    onSuccess: () => password.reset(),
  });
  if (me.isLoading || !me.data) return <div className="p-8">Loading…</div>;
  return (
    <AppShell user={me.data}>
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        description="Manage how your identity appears across Tracklume."
      />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <Avatar user={me.data} size="lg" />
            <div>
              <h2 className="font-semibold">Profile</h2>
              <p className="text-xs text-muted-foreground">
                Visible to project members.
              </p>
            </div>
          </div>
          <form
            className="space-y-5"
            onSubmit={profile.handleSubmit((data) => saveProfile.mutate(data))}
          >
            <div>
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                defaultValue={me.data.name}
                {...profile.register("name")}
              />
              <FieldError>{profile.formState.errors.name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="profile-avatar">Avatar URL</Label>
              <Input
                id="profile-avatar"
                defaultValue={me.data.avatar_url ?? ""}
                placeholder="https://..."
                {...profile.register("avatar_url")}
              />
              <FieldError>
                {profile.formState.errors.avatar_url?.message}
              </FieldError>
            </div>
            <Button type="submit" loading={saveProfile.isPending}>
              <UserRound className="h-4 w-4" />
              Save profile
            </Button>
          </form>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Password</h2>
              <p className="text-xs text-muted-foreground">
                Use a unique password for your account.
              </p>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={password.handleSubmit((data) =>
              savePassword.mutate({
                current_password: data.current_password,
                new_password: data.new_password,
              }),
            )}
          >
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                {...password.register("current_password")}
              />
              <FieldError>
                {password.formState.errors.current_password?.message}
              </FieldError>
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                {...password.register("new_password")}
              />
              <FieldError>
                {password.formState.errors.new_password?.message}
              </FieldError>
            </div>
            <div>
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                {...password.register("confirm_password")}
              />
              <FieldError>
                {password.formState.errors.confirm_password?.message}
              </FieldError>
            </div>
            <Button
              type="submit"
              variant="outline"
              loading={savePassword.isPending}
            >
              Update password
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
