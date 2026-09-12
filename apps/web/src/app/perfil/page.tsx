import type { Metadata } from "next";
import { ProfilePage } from "./profile-page";

export const metadata: Metadata = {
  title: "Meu perfil | ConectaFreela",
};

export default function PerfilPage() {
  return <ProfilePage />;
}
