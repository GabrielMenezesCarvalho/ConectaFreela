import type { Metadata } from "next";
import { ConversationThread } from "./conversation-thread";

export const metadata: Metadata = {
  title: "Conversa | ConectaFreela",
  description: "Mensagens trocadas sobre a candidatura.",
};

export default async function ConversaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ConversationThread conversationId={id} />;
}
