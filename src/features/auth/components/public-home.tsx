"use client";

import Link from "next/link";
import { ArrowRight, Check, Eye, Layers3, ListChecks } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui";
import { DemoLoginButton } from "@/features/auth/components/demo-login-button";

export function PublicHome() {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[440px] flex-col overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-16 lg:py-10">
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <BrandMark />
          Tracklume
        </div>
        <div className="relative z-10 mt-auto max-w-xl pb-8 pt-24 lg:pb-20">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            A clearer way to work
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One place for the work that matters.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
            Track tasks, bugs, and product ideas from the first note to done.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-indigo-300" />
            Clear ownership
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-indigo-300" />
            Visible progress
          </span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 right-12 h-px w-64 bg-indigo-400/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[5.9rem] right-[18.5rem] h-2 w-2 rounded-full bg-indigo-300/70"
        />
      </section>

      <section className="flex items-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Start with your work
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Get to a clear next step.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Create an account for your own projects, or look around the
            read-only demo first.
          </p>

          <div className="mt-8 space-y-3">
            <Link href="/register" className="block">
              <Button className="w-full">
                Create an account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <DemoLoginButton />
          </div>

          <div className="mt-12 grid gap-4 border-t border-border pt-6 text-sm">
            <div className="flex gap-3">
              <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Your own workspace</p>
                <p className="mt-1 text-muted-foreground">
                  Register once, then create projects where you are the owner.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Issues that stay visible</p>
                <p className="mt-1 text-muted-foreground">
                  Move work through a board, assign ownership, and keep context
                  close to the issue.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Safe public demo</p>
                <p className="mt-1 text-muted-foreground">
                  The demo account is viewer-only, so shared data stays intact.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
