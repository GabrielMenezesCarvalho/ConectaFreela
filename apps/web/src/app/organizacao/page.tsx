import type { Metadata } from "next";
import { OrganizerPanel } from "./organizer-panel";

export const metadata: Metadata = {
  title: "Painel do organizador | ConectaFreela",
  description: "Acompanhe suas oportunidades publicadas e as candidaturas recebidas.",
};

export default function OrganizacaoPage() {
  return <OrganizerPanel />;
}
