import type { Metadata } from "next";
import { ConversationList } from "./conversation-list";

export const metadata: Metadata = {
  title: "Mensagens | ConectaFreela",
  description: "Converse com talentos e organizadores das suas candidaturas.",
};

export default function MensagensPage() {
  return <ConversationList />;
}
