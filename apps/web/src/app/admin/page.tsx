import { RoleDashboard } from "@/components/role-dashboard";

export default function AdminPage() {
  return (
    <RoleDashboard
      requiredRole="ORGANIZATION"
      title="Painel administrativo"
      description="Visão geral dos usuários e oportunidades da plataforma."
      showUsers
    />
  );
}
