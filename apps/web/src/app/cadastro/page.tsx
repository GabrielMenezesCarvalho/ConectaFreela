import type { Metadata } from "next";
import CadastroForm from "./cadastro-form";

export const metadata: Metadata = {
  title: "Crie sua conta | ConectaFreela",
  description: "Cadastre-se como talento ou organização na ConectaFreela.",
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string | string[] }>;
}) {
  const { perfil } = await searchParams;
  const initialRole = perfil === "organizacao" ? "ORGANIZATION" : "TALENT";

  return <CadastroForm initialRole={initialRole} />;
}
