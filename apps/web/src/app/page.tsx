import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Microscope,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import dataLabImage from "@/assets/landing/data-lab.webp";
import designWorkshopImage from "@/assets/landing/design-workshop.webp";
import juniorEnterpriseImage from "@/assets/landing/junior-enterprise.webp";
import socialProjectImage from "@/assets/landing/social-project.webp";
import teamProjectImage from "@/assets/landing/team-project.webp";

const talentSteps = [
  [
    "01",
    "Crie seu perfil",
    "Apresente competências, portfólio e disponibilidade.",
  ],
  [
    "02",
    "Encontre um projeto",
    "Descubra oportunidades alinhadas aos seus interesses.",
  ],
  ["03", "Candidate-se", "Mostre à organização como você pode contribuir."],
];

const organizationSteps = [
  [
    "01",
    "Publique a necessidade",
    "Conte sobre o projeto e as competências necessárias.",
  ],
  [
    "02",
    "Conheça os talentos",
    "Receba candidaturas de pessoas interessadas no desafio.",
  ],
  ["03", "Forme sua equipe", "Escolha perfis e tire sua iniciativa do papel."],
];

const audiences: Array<{
  title: string;
  description: string;
  image: StaticImageData;
  alt: string;
  icon: typeof GraduationCap;
}> = [
  {
    title: "Estudantes",
    description: "Experiência prática ainda durante a graduação.",
    image: teamProjectImage,
    alt: "Estudantes desenvolvendo juntos um projeto de tecnologia sustentável",
    icon: GraduationCap,
  },
  {
    title: "Laboratórios",
    description: "Novas competências para pesquisas aplicadas.",
    image: dataLabImage,
    alt: "Estudante analisando dados em um laboratório de computação",
    icon: Microscope,
  },
  {
    title: "Projetos sociais",
    description: "Pessoas qualificadas para ampliar o impacto local.",
    image: socialProjectImage,
    alt: "Equipe trabalhando em uma horta comunitária",
    icon: HeartHandshake,
  },
  {
    title: "Empresas juniores",
    description: "Talentos para demandas reais e novos desafios.",
    image: juniorEnterpriseImage,
    alt: "Equipe universitária reunida para planejar um projeto",
    icon: Building2,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f4] text-[#0a1a12]">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f7f8f4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Página inicial">
            <BrandLogo />
          </Link>

          <nav
            className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex"
            aria-label="Navegação principal"
          >
            <a
              className="transition hover:text-emerald-700"
              href="#como-funciona"
            >
              Como funciona
            </a>
            <a className="transition hover:text-emerald-700" href="#para-quem">
              Para quem
            </a>
            <a className="transition hover:text-emerald-700" href="#comece">
              Comece agora
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              className="px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
              href="/entrar"
            >
              Entrar
            </Link>
            <Link
              className="rounded-xl bg-[#0a1a12] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:px-5"
              href="/cadastro"
            >
              Cadastrar grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero mx-auto grid max-w-[1600px] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="flex items-center px-5 py-16 sm:px-8 sm:py-24 lg:justify-end lg:px-14 lg:py-20">
            <div className="w-full max-w-xl lg:ml-auto">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Oportunidades acadêmicas e sociais
              </div>
              <h1 className="font-display text-[clamp(3.7rem,6.2vw,6.8rem)] leading-[0.88] tracking-[-0.045em]">
                Projetos precisam de ideias. Ideias precisam de pessoas.
              </h1>
              <p className="mt-8 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                A ConectaFreela aproxima talentos de laboratórios, ONGs e
                empresas juniores para transformar conhecimento em experiência
                real.
              </p>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700"
                  href="/cadastro?perfil=talento"
                >
                  Quero participar
                  <ArrowRight
                    className="transition group-hover:translate-x-1"
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  className="inline-flex items-center gap-1.5 px-2 py-3 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
                  href="/cadastro?perfil=organizacao"
                >
                  Tenho um projeto
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div className="landing-mosaic grid gap-2 px-5 pb-6 sm:px-8 sm:pb-8 lg:px-0 lg:pb-0">
            <MosaicImage
              className="mosaic-main"
              image={teamProjectImage}
              alt="Estudantes trabalhando em um projeto de tecnologia sustentável"
              priority
            >
              <span className="absolute bottom-4 left-4 bg-[#0a1a12] px-3 py-2 text-xs font-semibold text-white">
                Tecnologia sustentável · equipe universitária
              </span>
            </MosaicImage>
            <MosaicImage
              className="mosaic-data"
              image={dataLabImage}
              alt="Estudante trabalhando com tecnologia em laboratório"
            />
            <MosaicImage
              className="mosaic-design"
              image={designWorkshopImage}
              alt="Equipe apresentando conceitos visuais"
            />
            <MosaicImage
              className="mosaic-social"
              image={socialProjectImage}
              alt="Equipe colaborando em uma horta comunitária"
            >
              <span className="absolute bottom-4 left-4 bg-white px-3 py-2 text-xs font-semibold text-[#0a1a12]">
                Impacto local · projeto social
              </span>
            </MosaicImage>
            <MosaicImage
              className="mosaic-junior"
              image={juniorEnterpriseImage}
              alt="Equipe reunida para planejar um projeto"
            />
          </div>
        </section>

        <section className="border-y border-emerald-950/10 bg-[#0a1a12] text-white">
          <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            {[
              [
                "Conexões com propósito",
                "Projetos que geram aprendizado e impacto.",
              ],
              [
                "Dois perfis, um objetivo",
                "Talentos e organizações no mesmo ambiente.",
              ],
              [
                "Experiência que conta",
                "Colaboração prática para fortalecer trajetórias.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="py-7 sm:px-7 sm:first:pl-0 sm:last:pr-0"
              >
                <p className="text-sm font-bold text-emerald-300">{title}</p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="como-funciona"
          className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 border-b border-slate-200 pb-12 md:grid-cols-[0.9fr_1.1fr] md:items-end">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Como funciona
                </p>
                <h2 className="font-display text-5xl leading-none tracking-[-0.03em] sm:text-6xl">
                  Dois caminhos.
                  <br />
                  Um lugar para colaborar.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-slate-500 md:justify-self-end">
                Quem quer aprender encontra desafios concretos. Quem tem um
                projeto encontra pessoas prontas para colocá-lo em prática.
              </p>
            </div>

            <div className="grid gap-16 pt-12 lg:grid-cols-2 lg:gap-24">
              <PathColumn
                title="Para talentos"
                kicker="Aprender fazendo"
                steps={talentSteps}
                href="/cadastro?perfil=talento"
                cta="Criar perfil de talento"
                accent="green"
              />
              <PathColumn
                title="Para organizações"
                kicker="Tirar projetos do papel"
                steps={organizationSteps}
                href="/cadastro?perfil=organizacao"
                cta="Cadastrar organização"
                accent="dark"
              />
            </div>
          </div>
        </section>

        <section
          id="para-quem"
          className="scroll-mt-24 bg-[#f7f8f4] px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-5 border-b border-slate-300 pb-7 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Uma rede diversa
                </p>
                <h2 className="font-display text-5xl leading-none tracking-[-0.03em] sm:text-6xl">
                  Feito para quem faz.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-500">
                Diferentes contextos, conectados pela vontade de aprender e
                gerar resultado concreto.
              </p>
            </div>

            <div className="grid gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map(
                ({ title, description, image, alt, icon: Icon }) => (
                  <article key={title} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200">
                      <Image
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                        src={image}
                        alt={alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="mt-4 flex items-start gap-3 border-t border-slate-300 pt-4">
                      <Icon
                        className="mt-0.5 shrink-0 text-emerald-700"
                        size={18}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="text-sm font-bold">{title}</h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          id="comece"
          className="scroll-mt-20 bg-emerald-700 px-5 py-16 text-white sm:px-8 sm:py-20"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                <CheckCircle2 size={18} aria-hidden="true" />
                Cadastro gratuito
              </div>
              <h2 className="font-display max-w-3xl text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
                Seu próximo projeto pode começar aqui.
              </h2>
            </div>
            <Link
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              href="/cadastro"
            >
              Criar minha conta
              <ArrowRight
                className="transition group-hover:translate-x-1"
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <BrandLogo compact />
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <a
              className="transition hover:text-emerald-700"
              href="#como-funciona"
            >
              Como funciona
            </a>
            <span>© 2026 ConectaFreela</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MosaicImage({
  className,
  image,
  alt,
  priority = false,
  children,
}: {
  className: string;
  image: StaticImageData;
  alt: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-xl bg-slate-200 lg:rounded-none ${className}`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover"
      />
      {children}
    </figure>
  );
}

function PathColumn({
  title,
  kicker,
  steps,
  href,
  cta,
  accent,
}: {
  title: string;
  kicker: string;
  steps: string[][];
  href: string;
  cta: string;
  accent: "green" | "dark";
}) {
  return (
    <div>
      <div
        className={`mb-4 flex items-center justify-between border-b-2 pb-4 ${accent === "green" ? "border-emerald-600" : "border-[#0a1a12]"}`}
      >
        <h3 className="text-lg font-bold">{title}</h3>
        <span
          className={`text-xs font-bold uppercase tracking-[0.16em] ${accent === "green" ? "text-emerald-700" : "text-slate-500"}`}
        >
          {kicker}
        </span>
      </div>
      <ol>
        {steps.map(([number, stepTitle, description]) => (
          <li
            key={number}
            className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-slate-200 py-5"
          >
            <span
              className={`font-display text-2xl ${accent === "green" ? "text-emerald-700" : "text-[#0a1a12]"}`}
            >
              {number}
            </span>
            <div>
              <p className="text-sm font-bold">{stepTitle}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        className={`mt-7 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 ${accent === "green" ? "text-emerald-700 decoration-emerald-300" : "text-[#0a1a12] decoration-slate-300"}`}
        href={href}
      >
        {cta}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
