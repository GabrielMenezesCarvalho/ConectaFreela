import type { Metadata } from "next";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = {
  title: "Publicar oportunidade | ConectaFreela",
  description: "Descreva seu projeto e receba candidaturas de talentos.",
};

export default function PublicarPage() {
  return <PublishForm />;
}
