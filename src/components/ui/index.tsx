"use client";
/* eslint-disable @next/next/no-img-element */

import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/date";
import { priorityLabels, statusLabels, typeLabels } from "@/lib/utils/labels";
import type { IssuePriority, IssueStatus, IssueType, User } from "@/types";

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "icon";
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        {
          primary: "bg-primary text-white shadow-sm hover:bg-primary/90",
          secondary: "bg-foreground text-background hover:opacity-90",
          ghost:
            "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          danger: "bg-destructive text-white hover:bg-destructive/90",
          outline:
            "border border-border bg-surface text-foreground hover:bg-background",
        }[variant],
        { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", icon: "h-9 w-9" }[
          size
        ],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {props.children}
    </button>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
});
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
});
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
          className,
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
    </div>
  );
});
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function FieldError({ children }: { children?: React.ReactNode }) {
  return children ? (
    <p className="mt-1.5 text-xs text-destructive" role="alert">
      {children}
    </p>
  ) : null;
}
export function Avatar({
  user,
  size = "md",
}: {
  user?: Pick<User, "name" | "avatar_url"> | null;
  size?: "sm" | "md" | "lg";
}) {
  return user?.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.name}
      className={cn(
        "rounded-full object-cover",
        { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-11 w-11" }[size],
      )}
    />
  ) : (
    <span
      aria-label={user?.name ?? "Unknown user"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        {
          sm: "h-6 w-6 text-[10px]",
          md: "h-8 w-8 text-xs",
          lg: "h-11 w-11 text-sm",
        }[size],
      )}
    >
      {initials(user?.name)}
    </span>
  );
}

const badgeBase =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold";
export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={cn(
        badgeBase,
        {
          backlog: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
          todo: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
          in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
          done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        }[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <span
      className={cn(
        badgeBase,
        {
          low: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
          medium: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
          high: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
          urgent: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        }[priority],
      )}
    >
      {priority === "urgent" ? "↑" : priority === "high" ? "↗" : "→"}{" "}
      {priorityLabels[priority]}
    </span>
  );
}
export function TypeBadge({ type }: { type: IssueType }) {
  return (
    <span
      className={cn(
        badgeBase,
        {
          task: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
          bug: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
          feature: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
        }[type],
      )}
    >
      {type === "bug" ? "◆" : type === "feature" ? "✦" : "◇"} {typeLabels[type]}
    </span>
  );
}

export function Spinner() {
  return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
export function ErrorState({
  message = "We couldn't load this right now.",
  onRetry,
  requestId,
}: {
  message?: string;
  onRetry?: () => void;
  requestId?: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-foreground">{message}</p>
      {requestId && (
        <p className="text-xs text-muted-foreground">Request ID: {requestId}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
      <span className="rounded-xl bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search issues...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState(value);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    setInput(value);
  }, [value]);
  useEffect(() => () => timeout.current && clearTimeout(timeout.current), []);
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = setTimeout(() => onChange(e.target.value), 300);
        }}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-sm shadow-soft",
        type === "error" ? "border-destructive/30" : "border-emerald-500/30",
      )}
      role="status"
    >
      <span
        className={cn(
          "rounded-full p-1",
          type === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-emerald-500/10 text-emerald-600",
        )}
      >
        {type === "error" ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="flex-1">{message}</span>
      <button aria-label="Dismiss notification" onClick={onClose}>
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
