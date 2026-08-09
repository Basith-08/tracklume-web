"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Search, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  SearchInput,
  Select,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/shared/page-state";
import {
  AccountStatus,
  AdminFrame,
} from "@/features/admin/components/admin-frame";
import { UserStatusDialog } from "@/features/admin/components/user-status-dialog";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";
import { queryString } from "@/lib/api/client";
import { formatDate } from "@/lib/utils/date";
import type { AdminUser, AdminUserFilters, AdminUserStatus } from "@/types";

export default function AdminUsersPage() {
  const params = useSearchParams();
  const router = useRouter();
  const client = useQueryClient();
  const [statusUser, setStatusUser] = useState<AdminUser>();
  const filters = useMemo<AdminUserFilters>(
    () => ({
      search: params.get("search") ?? "",
      status: (params.get("status") as AdminUserStatus) || "all",
      page: Number(params.get("page") || "1"),
      per_page: 20,
    }),
    [params],
  );
  const users = useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => resources.adminUsers(filters),
  });
  const updateStatus = useMutation({
    mutationFn: ({ user, reason }: { user: AdminUser; reason?: string }) =>
      resources.updateAdminUserStatus(user.id, {
        is_active: !user.is_active,
        reason,
      }),
    onSuccess: async () => {
      setStatusUser(undefined);
      await client.invalidateQueries({ queryKey: ["admin"] });
    },
  });
  const updateFilters = (next: Partial<AdminUserFilters>) => {
    const merged = { ...filters, ...next, page: next.page ?? 1 };
    const query = queryString(merged);
    router.replace(`/admin/users${query ? `?${query}` : ""}`);
  };
  const activeFilters = Boolean(filters.search || filters.status !== "all");
  return (
    <AdminFrame>
      <div className="mb-5">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin overview
        </Link>
      </div>
      <PageHeader
        eyebrow="Platform"
        title="Users"
        description="Review account status and open a user record for support."
      />
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(search) => updateFilters({ search })}
            placeholder="Search by name or email"
          />
        </div>
        <Select
          aria-label="Filter account status"
          value={filters.status ?? "all"}
          onChange={(event) =>
            updateFilters({ status: event.target.value as AdminUserStatus })
          }
          className="sm:w-40"
        >
          <option value="all">All accounts</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </Select>
      </div>
      {users.isLoading ? (
        <UserListSkeleton />
      ) : users.error ? (
        <ErrorState
          message="We couldn't load the user directory."
          onRetry={() => users.refetch()}
        />
      ) : !users.data?.data.length ? (
        <EmptyState
          icon={activeFilters ? Search : UserRound}
          title={
            activeFilters ? "No users match these filters" : "No users yet"
          }
          description={
            activeFilters
              ? "Clear a filter or try a different search."
              : "Registered users will appear here."
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="hidden grid-cols-[minmax(220px,1.4fr)_130px_110px_120px_120px] gap-3 border-b border-border bg-muted/50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>User</span>
              <span>Status</span>
              <span>Role</span>
              <span>Last login</span>
              <span>Projects</span>
            </div>
            {users.data.data.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onStatus={() => setStatusUser(user)}
              />
            ))}
          </div>
          <Pagination
            page={users.data.meta.page}
            totalPages={users.data.meta.total_pages}
            onChange={(page) => updateFilters({ page })}
          />
        </>
      )}
      {statusUser && (
        <UserStatusDialog
          user={statusUser}
          onClose={() => setStatusUser(undefined)}
          onConfirm={(reason) =>
            updateStatus.mutate({ user: statusUser, reason })
          }
          loading={updateStatus.isPending}
        />
      )}
    </AdminFrame>
  );
}

function UserRow({
  user,
  onStatus,
}: {
  user: AdminUser;
  onStatus: () => void;
}) {
  const isDeleted = Boolean(user.deleted_at);
  return (
    <div className="grid gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[minmax(220px,1.4fr)_130px_110px_120px_120px] md:items-center">
      <Link
        href={`/admin/users/${user.id}`}
        className="flex min-w-0 items-center gap-3 hover:text-primary"
      >
        <Avatar user={user} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
      </Link>
      <div className="flex items-center justify-between gap-2 md:block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
          Status
        </span>
        <AccountStatus user={user} />
      </div>
      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground md:block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
          Role
        </span>
        {user.platform_role}
      </span>
      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground md:block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
          Last login
        </span>
        {formatDate(user.last_login_at)}
      </span>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground md:block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
          Projects
        </span>
        <div className="flex items-center justify-between gap-2 md:justify-end">
          <span>{user.owned_projects + user.member_projects}</span>
          <Link href={`/admin/users/${user.id}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`View ${user.name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {!isDeleted && user.platform_role !== "superadmin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStatus}
              className={user.is_active ? "text-destructive" : "text-primary"}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}
