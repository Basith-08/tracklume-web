"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/ui";
import type { AdminUser } from "@/types";

export function UserStatusDialog({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("");
  const activating = !user.is_active;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-status-title"
      >
        <h2 id="account-status-title" className="text-lg font-semibold">
          {activating ? "Activate account" : "Deactivate account"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {activating
            ? `${user.name} will be able to sign in and use their projects again.`
            : `${user.name} will be signed out on their next request and won't be able to sign in.`}
        </p>
        {!activating && (
          <div className="mt-5">
            <label
              htmlFor="deactivation-reason"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Reason
            </label>
            <Textarea
              id="deactivation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is this account being deactivated?"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              A reason is required for support records.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={activating ? "primary" : "danger"}
            loading={loading}
            disabled={!activating && reason.trim().length < 3}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {activating ? "Activate account" : "Deactivate account"}
          </Button>
        </div>
      </section>
    </div>
  );
}
