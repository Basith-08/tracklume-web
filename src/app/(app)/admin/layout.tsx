import { PlatformAdminGuard } from "@/components/shared/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformAdminGuard>{children}</PlatformAdminGuard>;
}
