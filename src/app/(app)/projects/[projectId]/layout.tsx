"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppShell, ShellLoader } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/ui";
import { queryKeys } from "@/lib/api/queries";
import { resources } from "@/lib/api/resources";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const me = useQuery({ queryKey: queryKeys.me(), queryFn: resources.me });
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => resources.projectContext(projectId, me.data!.id),
    enabled: Boolean(me.data),
  });
  if (me.isLoading || project.isLoading) return <ShellLoader />;
  if (project.error || !project.data)
    return (
      <div className="p-8">
        <ErrorState message="We couldn't open this project." />
      </div>
    );
  if (!me.data) return null;
  return (
    <AppShell user={me.data} projectId={projectId} project={project.data}>
      {children}
    </AppShell>
  );
}
