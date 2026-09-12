import type { Metadata } from "next";
import { PremiumCheckout } from "./premium-checkout";

export const metadata: Metadata = { title: "Assinar Premium | ConectaFreela" };
export default function AssinarPremiumPage() { return <PremiumCheckout />; }
