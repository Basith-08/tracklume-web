"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { resources } from "@/lib/api/resources";
import { queryKeys } from "@/lib/api/queries";
import { ErrorState, Spinner } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { isPlatformAdmin } from "@/lib/auth/permissions";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: resources.me,
    retry: false,
  });
  useEffect(() => {
    if (
      query.error instanceof ApiError &&
      query.error.status === 401 &&
      pathname !== "/login"
    ) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, query.error, router]);
  if (query.isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  if (query.error instanceof ApiError && query.error.status === 401) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (query.error)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          message="We couldn't connect to Tracklume. Try again in a moment."
          onRetry={() => query.refetch()}
        />
      </div>
    );
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: resources.me,
    retry: false,
  });
  useEffect(() => {
    if (query.data) router.replace("/projects");
  }, [query.data, router]);
  if (query.isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  if (query.data) {
    return null;
  }
  return <>{children}</>;
}

export function PlatformAdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: resources.me,
    retry: false,
  });
  if (query.isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  if (query.error)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          message="We couldn't verify your platform access."
          onRetry={() => query.refetch()}
        />
      </div>
    );
  if (!isPlatformAdmin(query.data?.platform_role))
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState message="Platform admin access is restricted." />
      </div>
    );
  return <>{children}</>;
}
