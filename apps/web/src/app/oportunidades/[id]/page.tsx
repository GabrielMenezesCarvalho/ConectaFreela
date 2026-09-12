import type { Metadata } from "next";
import { OpportunityDetail } from "./opportunity-detail";

export const metadata: Metadata = { title: "Detalhes da oportunidade | ConectaFreela" };
export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail opportunityId={id} />;
}
