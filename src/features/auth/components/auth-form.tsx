"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { DemoLoginButton } from "@/features/auth/components/demo-login-button";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { resources } from "@/lib/api/resources";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validation/schemas";

export function AuthFrame({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="relative hidden w-[42%] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <BrandMark />
            Tracklume
          </div>
          <div className="relative z-10 max-w-sm">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              A clearer way to work
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Keep the work moving.
            </h1>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Track tasks, bugs, and product ideas in one calm workspace.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Kelola tugas, bug, dan ide produk dengan lebih terarah.
            </p>
          </div>
          <div className="relative z-10 text-xs text-slate-400">
            Clear ownership · Fewer loose ends
          </div>
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-indigo-400/30 bg-indigo-500/20 blur-3xl" />
          <div className="absolute right-16 top-20 h-56 w-56 rounded-full border border-cyan-300/10" />
        </aside>
        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BrandMark />
                Tracklume
              </div>
            </div>
            {children}
            <p className="mt-9 text-center text-xs text-muted-foreground">
              {mode === "login" ? (
                <>
                  New to Tracklume?{" "}
                  <Link
                    className="font-semibold text-primary hover:underline"
                    href="/register"
                  >
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    className="font-semibold text-primary hover:underline"
                    href="/login"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: resources.login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/projects");
      router.refresh();
    },
  });
  const submit = (data: LoginInput) => mutation.mutate(data);
  return (
    <AuthFrame mode="login">
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Sign in to Tracklume
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          See what needs attention and keep work moving.
        </p>
      </div>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </div>
        {mutation.error && (
          <p
            className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {mutation.error instanceof ApiError
              ? authErrorMessage(mutation.error, "We couldn't sign you in.")
              : "Unable to sign in. Try again."}
          </p>
        )}
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Local development seed</strong>
          <br />
          owner@tracklume.local · Password123!
        </div>
      )}
      <DemoLoginButton className="mt-3" />
    </AuthFrame>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm_password: "" },
  });
  const mutation = useMutation({
    mutationFn: (data: RegisterInput) =>
      resources.register({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    onSuccess: () => router.push("/login"),
  });
  return (
    <AuthFrame mode="register">
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your Tracklume account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Give your team one place for tasks, bugs, and product ideas.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        noValidate
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            {...form.register("name")}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...form.register("password")}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...form.register("confirm_password")}
          />
          <FieldError>
            {form.formState.errors.confirm_password?.message}
          </FieldError>
        </div>
        {mutation.error && (
          <p
            className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {mutation.error instanceof ApiError
              ? authErrorMessage(
                  mutation.error,
                  "We couldn't create your account.",
                )
              : "Unable to create your account."}
          </p>
        )}
        <Button
          type="submit"
          className="mt-2 w-full"
          loading={mutation.isPending}
        >
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthFrame>
  );
}

function authErrorMessage(error: ApiError, fallback: string) {
  if (error.code === "ACCOUNT_INACTIVE")
    return "Your account is inactive. Please contact support.";
  if (error.code === "CONFLICT")
    return "An account with this email already exists. Sign in instead.";
  if (error.status === 422)
    return "Check the highlighted fields and try again.";
  if (error.status === 503)
    return "Tracklume is temporarily unavailable. Try again shortly.";
  return `${fallback} Try again.`;
}
