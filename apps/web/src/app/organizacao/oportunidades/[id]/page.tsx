import type { Metadata } from "next";
import { CandidatesReview } from "./candidates-review";

export const metadata: Metadata = {
  title: "Candidatos | ConectaFreela",
  description: "Revise as candidaturas recebidas na sua oportunidade.",
};

export default async function OportunidadeCandidatosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CandidatesReview opportunityId={id} />;
}
