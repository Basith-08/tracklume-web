"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  FolderKanban,
  ListTodo,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Button, ErrorState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import { AdminFrame } from "@/features/admin/components/admin-frame";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";

export default function AdminOverviewPage() {
  const overview = useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: resources.adminOverview,
  });
  return (
    <AdminFrame>
      <PageHeader
        eyebrow="Platform"
        title="Admin overview"
        description="Monitor accounts and product activity from one place."
        action={
          <Link href="/admin/users">
            <Button variant="outline">
              <UsersRound className="h-4 w-4" />
              Manage users
            </Button>
          </Link>
        }
      />
      {overview.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : overview.error || !overview.data ? (
        <ErrorState
          message="We couldn't load the platform overview."
          onRetry={() => overview.refetch()}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={UsersRound}
              label="Total users"
              value={overview.data.total_users}
              detail={`${overview.data.new_users_7d} new in 7 days`}
            />
            <Metric
              icon={UserPlus}
              label="Active users"
              value={overview.data.active_users}
              detail={`${overview.data.active_users_7d} active in 7 days`}
              accent
            />
            <Metric
              icon={FolderKanban}
              label="Projects"
              value={overview.data.total_projects}
              detail={`${overview.data.inactive_users} inactive accounts`}
            />
            <Metric
              icon={ListTodo}
              label="Active issues"
              value={overview.data.active_issues}
              detail={`${overview.data.deleted_users} deleted accounts`}
            />
          </div>
          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Account support</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search users, review account status, and handle access issues.
              </p>
            </div>
            <Link href="/admin/users">
              <Button variant="secondary">
                Open user directory <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AdminFrame>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`border-l-2 bg-surface px-4 py-3 ${accent ? "border-primary" : "border-border"}`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : ""}`} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}
