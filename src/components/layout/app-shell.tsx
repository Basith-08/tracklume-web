"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, Button, Spinner } from "@/components/ui";
import { BrandMark } from "@/components/shared/brand-mark";
import { resources } from "@/lib/api/resources";
import { queryKeys } from "@/lib/api/queries";
import { cn } from "@/lib/utils/cn";
import { roleLabels } from "@/lib/utils/labels";
import { IssueForm } from "@/features/issues/components/issue-form";
import type { Project } from "@/types";

export function AppShell({
  children,
  projectId,
  project,
  user,
}: {
  children: React.ReactNode;
  projectId?: string;
  project?: Project;
  user: import("@/types").User;
}) {
  const [open, setOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    const stored = localStorage.getItem("tracklume-theme");
    const isDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const projects = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: resources.projects,
  });
  const logout = useMutation({
    mutationFn: resources.logout,
    onSuccess: () => {
      client.clear();
      router.push("/login");
    },
  });
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("tracklume-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };
  const projectBase = projectId ? `/projects/${projectId}` : "/projects";
  const nav = projectId
    ? [
        { href: projectBase, label: "Overview", icon: LayoutDashboard },
        { href: `${projectBase}/board`, label: "Board", icon: BarChart3 },
        { href: `${projectBase}/issues`, label: "Issues", icon: ListTodo },
        { href: `${projectBase}/members`, label: "Members", icon: Users },
        {
          href: `${projectBase}/settings`,
          label: "Project settings",
          icon: Settings,
        },
      ]
    : [];
  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <BrandMark />
            Tracklume
          </Link>
          <button
            className="rounded-md p-1 text-muted-foreground lg:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3">
          <ProjectSwitcher
            projects={projects.data?.data ?? []}
            current={project}
          />
        </div>
        {project && (
          <div className="px-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Project
            </p>
            <nav className="space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    pathname === href
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <div className="mt-auto border-t border-border p-3">
          <Link
            href="/settings/profile"
            className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
          >
            <Avatar user={user} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </Link>
          <div className="flex gap-1">
            <button
              onClick={toggleTheme}
              className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}{" "}
              {dark ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={() => logout.mutate()}
              className="rounded-lg px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/35 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {project ? (
              <>
                <span className="font-medium text-foreground">
                  {project.name}
                </span>
                <span className="mx-2">/</span>
                {nav.find((item) => item.href === pathname)?.label ??
                  "Overview"}
              </>
            ) : (
              "All projects"
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
              {project ? roleLabels[project.current_user_role] : "Workspace"}
            </span>
            {projectId && (
              <Button size="sm" onClick={() => setIssueOpen(true)}>
                <Plus className="h-4 w-4" />
                New issue
              </Button>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {issueOpen && projectId && (
        <IssueForm projectId={projectId} onClose={() => setIssueOpen(false)} />
      )}{" "}
    </div>
  );
}

function ProjectSwitcher({
  projects,
  current,
}: {
  projects: Project[];
  current?: Project;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-primary/40"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
          {current?.key?.slice(0, 2) ?? "∑"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold">
            {current?.name ?? "Select a project"}
          </span>
          <span className="block truncate text-[10px] text-muted-foreground">
            {current?.key ?? "Your workspace"}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {show && (
        <div className="absolute left-0 right-0 top-12 z-20 rounded-xl border border-border bg-surface p-1.5 shadow-soft">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={() => setShow(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted"
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                {project.key.slice(0, 2)}
              </span>
              <span className="flex-1 truncate">{project.name}</span>
              {current?.id === project.id && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </Link>
          ))}
          <Link
            href="/projects"
            onClick={() => setShow(false)}
            className="mt-1 flex items-center gap-2 border-t border-border px-2 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            All projects
          </Link>
        </div>
      )}
    </div>
  );
}

export function ShellLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
