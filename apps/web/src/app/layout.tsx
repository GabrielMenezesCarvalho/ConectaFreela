import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ConectaFreela | Talentos e projetos que transformam",
  description:
    "Conectamos talentos a laboratórios, ONGs e empresas juniores para criar projetos com impacto real.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `data-scroll-behavior` é exigido a partir do Next 16 para que a navegação
    // entre rotas ignore o `scroll-behavior: smooth` global do globals.css.
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${instrumentSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
