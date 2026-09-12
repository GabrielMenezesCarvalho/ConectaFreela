import type { Metadata } from "next";
import { TalentApplications } from "./talent-applications";

export const metadata: Metadata = {
  title: "Minhas candidaturas | ConectaFreela",
  description: "Acompanhe o andamento das suas candidaturas.",
};

export default function ApplicationsPage() {
  return <TalentApplications />;
}
