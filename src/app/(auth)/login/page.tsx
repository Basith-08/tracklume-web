import { LoginForm } from "@/features/auth/components/auth-form";
import { PublicOnly } from "@/components/shared/auth-guard";
export default function LoginPage() {
  return (
    <PublicOnly>
      <LoginForm />
    </PublicOnly>
  );
}
