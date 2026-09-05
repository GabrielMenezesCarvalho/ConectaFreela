import { RoleDashboard } from "@/components/role-dashboard";

export default function OportunidadesPage() {
  return (
    <RoleDashboard
      requiredRole="TALENT"
      title="Oportunidades"
      description="Projetos disponíveis para o seu perfil de talento."
    />
  );
}
