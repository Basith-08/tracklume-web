"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { resources } from "@/lib/api/resources";
import { queryKeys } from "@/lib/api/queries";
import { ErrorState, Spinner } from "@/components/ui";
import { ApiError } from "@/lib/api/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
  if (query.error instanceof ApiError && query.error.status === 401) {
    if (typeof window !== "undefined" && pathname !== "/login")
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
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
          message="The Tracklume API is unavailable."
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
  if (query.isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  if (query.data) {
    router.replace("/projects");
    return null;
  }
  return <>{children}</>;
}
