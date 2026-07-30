"use client";
import { PublicOnly } from "@/components/shared/auth-guard";
import { PublicHome } from "@/features/auth/components/public-home";

export default function HomePage() {
  return (
    <PublicOnly>
      <PublicHome />
    </PublicOnly>
  );
}
