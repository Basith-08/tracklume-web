"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell, ShellLoader } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/ui";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const me = useQuery({ queryKey: queryKeys.me(), queryFn: resources.me });
  if (me.isLoading) return <ShellLoader />;
  if (me.error || !me.data)
    return (
      <div className="p-8">
        <ErrorState message="We couldn't load your admin profile." />
      </div>
    );
  return <AppShell user={me.data}>{children}</AppShell>;
}

export function AccountStatus({
  user,
}: {
  user: { is_active: boolean; deleted_at?: string | null };
}) {
  const label = user.deleted_at
    ? "Deleted"
    : user.is_active
      ? "Active"
      : "Inactive";
  const tone = user.deleted_at
    ? "bg-muted text-muted-foreground"
    : user.is_active
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}
