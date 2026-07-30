"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
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
import { formatDate } from "@/lib/utils/date";
import type { AdminUser } from "@/types";

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const client = useQueryClient();
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const user = useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => resources.adminUser(userId),
  });
  const updateStatus = useMutation({
    mutationFn: (reason?: string) =>
      resources.updateAdminUserStatus(userId, {
        is_active: !user.data?.is_active,
        reason,
      }),
    onSuccess: async (saved) => {
      setStatusOpen(false);
      client.setQueryData(queryKeys.admin.user(userId), saved);
      await client.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
  const remove = useMutation({
    mutationFn: () => resources.deleteAdminUser(userId),
    onSuccess: async () => {
      setDeleteOpen(false);
      await client.invalidateQueries({ queryKey: ["admin"] });
      user.refetch();
    },
  });
  const restore = useMutation({
    mutationFn: () => resources.restoreAdminUser(userId),
    onSuccess: (saved) =>
      client.setQueryData(queryKeys.admin.user(userId), saved),
  });
  return (
    <AdminFrame>
      <div className="mb-5">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          User directory
        </Link>
      </div>
      {user.isLoading ? (
        <Skeleton className="h-96" />
      ) : user.error || !user.data ? (
        <ErrorState
          message="We couldn't load this user."
          onRetry={() => user.refetch()}
        />
      ) : (
        <UserDetails
          user={user.data}
          onStatus={() => setStatusOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onRestore={() => restore.mutate()}
          restoring={restore.isPending}
        />
      )}
      {user.data && statusOpen && (
        <UserStatusDialog
          user={user.data}
          onClose={() => setStatusOpen(false)}
          onConfirm={(reason) => updateStatus.mutate(reason)}
          loading={updateStatus.isPending}
        />
      )}
      {user.data && (
        <ConfirmDialog
          open={deleteOpen}
          title={`Delete ${user.data.name}'s account?`}
          description="This soft-deletes the account and keeps its project and activity relationships available for recovery."
          confirmLabel="Delete account"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => remove.mutate()}
          loading={remove.isPending}
        />
      )}
    </AdminFrame>
  );
}

function UserDetails({
  user,
  onStatus,
  onDelete,
  onRestore,
  restoring,
}: {
  user: AdminUser;
  onStatus: () => void;
  onDelete: () => void;
  onRestore: () => void;
  restoring: boolean;
}) {
  const deleted = Boolean(user.deleted_at);
  const protectedAccount = user.platform_role === "superadmin";
  return (
    <>
      <PageHeader
        eyebrow="Platform user"
        title={user.name}
        description={user.email}
        action={
          <div className="flex flex-wrap gap-2">
            {!deleted && !protectedAccount && (
              <Button
                variant={user.is_active ? "outline" : "primary"}
                onClick={onStatus}
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </Button>
            )}
            {deleted && (
              <Button variant="primary" loading={restoring} onClick={onRestore}>
                Restore account
              </Button>
            )}
            {!deleted && !protectedAccount && (
              <Button variant="danger" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            )}
          </div>
        }
      />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <Avatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{user.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
            <AccountStatus user={user} />
          </div>
          <div className="grid gap-5 pt-5 sm:grid-cols-2">
            <Detail
              label="Platform role"
              value={user.platform_role}
              icon={ShieldCheck}
            />
            <Detail
              label="Joined"
              value={formatDate(user.created_at)}
              icon={UserRound}
            />
            <Detail label="Last login" value={formatDate(user.last_login_at)} />
            <Detail
              label="Deactivated"
              value={formatDate(user.deactivated_at)}
            />
          </div>
          {user.deactivation_reason && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Deactivation reason
              </p>
              <p className="mt-2 text-sm">{user.deactivation_reason}</p>
            </div>
          )}
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-semibold">Activity summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Counts returned by the platform API.
          </p>
          <div className="mt-6 divide-y divide-border">
            <Count label="Owned projects" value={user.owned_projects} />
            <Count label="Member projects" value={user.member_projects} />
            <Count label="Reported issues" value={user.reported_issues} />
          </div>
        </section>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="mr-1 inline h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
