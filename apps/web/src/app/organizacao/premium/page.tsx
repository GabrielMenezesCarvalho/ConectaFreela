import type { Metadata } from "next";
import { PremiumOffer } from "./premium-offer";

export const metadata: Metadata = {
  title: "Premium para organizadores | ConectaFreela",
};

export default function PremiumPage() {
  return <PremiumOffer />;
}
