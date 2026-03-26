import { useProfile } from "@/hooks/use-profile";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function SecondPhaseGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não for assinante da 2ª fase, redireciona para o início
  if (profile?.assinante_2_fase !== true) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
