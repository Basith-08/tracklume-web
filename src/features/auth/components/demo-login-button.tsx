"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { resources } from "@/lib/api/resources";

export function DemoLoginButton({ className }: { className?: string }) {
  const router = useRouter();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: resources.demoLogin,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["me"] });
      router.push("/projects");
      router.refresh();
    },
  });

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Opening demo" : "Try the read-only demo"}
        {!mutation.isPending && <ArrowUpRight className="h-4 w-4" />}
      </Button>
      {mutation.error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {demoErrorMessage(mutation.error)}
        </p>
      )}
    </div>
  );
}

function demoErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "The demo is unavailable right now.";
  if (error.code === "ACCOUNT_INACTIVE")
    return "This demo account is inactive. Contact support.";
  if (error.code === "DEMO_NOT_CONFIGURED")
    return "The demo is not configured yet.";
  return "The demo is unavailable right now. Please try again later.";
}
