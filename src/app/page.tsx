"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resources } from "@/lib/api/resources";
import { queryKeys } from "@/lib/api/queries";
import { Spinner } from "@/components/ui";
export default function HomePage() {
  const router = useRouter();
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: resources.me,
    retry: false,
  });
  useEffect(() => {
    if (!query.isLoading) router.replace(query.data ? "/projects" : "/login");
  }, [query.data, query.isLoading, router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
