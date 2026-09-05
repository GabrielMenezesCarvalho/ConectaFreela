import { RoleDashboard } from "@/components/role-dashboard";

export default function AdminPage() {
  return (
    <RoleDashboard
      requiredRole="ORGANIZATION"
      title="Painel administrativo"
      description="Listagem inicial de oportunidades para a organização."
    />
  );
}
