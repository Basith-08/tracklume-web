import { RegisterForm } from "@/features/auth/components/auth-form";
import { PublicOnly } from "@/components/shared/auth-guard";
export default function RegisterPage() {
  return (
    <PublicOnly>
      <RegisterForm />
    </PublicOnly>
  );
}
