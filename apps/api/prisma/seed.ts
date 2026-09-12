import { fakerPT_BR as faker } from '@faker-js/faker';
import {
  ApplicationStatus,
  BillingCycle,
  Modality,
  OpportunityType,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import { createHash, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

const RECORDS_PER_PROFILE_TYPE = 20;
const SEED_PASSWORD = 'Conecta@123';
const ADMIN_EMAIL = 'admin@conectafreela.com.br';

const skillCatalog = [
  'Comunicação',
  'Design gráfico',
  'Figma',
  'Gestão de projetos',
  'JavaScript',
  'Marketing digital',
  'Node.js',
  'Pesquisa acadêmica',
  'React',
  'Redação',
  'TypeScript',
  'UX Research',
];

const availabilityOptions = [
  'Até 5 horas por semana',
  'De 5 a 10 horas por semana',
  'Mais de 10 horas por semana',
];

function seedEmail(profile: 'talento' | 'organizacao', index: number) {
  return `${profile}.${String(index).padStart(2, '0')}@example.com`;
}

async function hashSeedPassword(email: string) {
  const salt = createHash('sha256').update(email).digest('hex').slice(0, 32);
  const derivedKey = (await scryptAsync(SEED_PASSWORD, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString('hex')}`;
}

async function seedTalents() {
  for (let index = 1; index <= RECORDS_PER_PROFILE_TYPE; index += 1) {
    const email = seedEmail('talento', index);
    const name = faker.person.fullName();
    const passwordHash = await hashSeedPassword(email);
    const skills = faker.helpers.arrayElements(skillCatalog, {
      min: 3,
      max: 6,
    });
    const availability = faker.helpers.arrayElement(availabilityOptions);

    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: UserRole.TALENT,
        talentProfile: {
          upsert: {
            create: {
              bio: `${name} tem interesse em projetos de ${skills[0]} e ${skills[1]}.`,
              skills,
              availability,
              portfolioLinks: [`https://portfolio.example/talento-${index}`],
            },
            update: {
              bio: `${name} tem interesse em projetos de ${skills[0]} e ${skills[1]}.`,
              skills,
              availability,
              portfolioLinks: [`https://portfolio.example/talento-${index}`],
            },
          },
        },
      },
      create: {
        name,
        email,
        passwordHash,
        role: UserRole.TALENT,
        talentProfile: {
          create: {
            bio: `${name} tem interesse em projetos de ${skills[0]} e ${skills[1]}.`,
            skills,
            availability,
            portfolioLinks: [`https://portfolio.example/talento-${index}`],
          },
        },
      },
    });
  }
}

async function seedOrganizations() {
  for (let index = 1; index <= RECORDS_PER_PROFILE_TYPE; index += 1) {
    const email = seedEmail('organizacao', index);
    const name = faker.company.name();
    const passwordHash = await hashSeedPassword(email);

    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: UserRole.ORGANIZATION,
      },
      create: {
        name,
        email,
        passwordHash,
        role: UserRole.ORGANIZATION,
      },
    });
  }
}

async function seedAdmin() {
  const passwordHash = await hashSeedPassword(ADMIN_EMAIL);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: 'Administrador ConectaFreela',
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Administrador ConectaFreela',
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

async function seedPremiumSubscriptions(organizerIds: string[]) {
  await prisma.premiumPayment.deleteMany({
    where: { userId: { in: organizerIds } },
  });
  for (const [index, userId] of organizerIds.slice(0, 4).entries()) {
    const billingCycle = BillingCycle.MONTHLY;
    const nextBillingAt = new Date();
    nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
    await prisma.premiumSubscription.upsert({
      where: { userId },
      create: {
        userId,
        billingCycle,
        priceCents: 3000,
        paymentMethodLast4: `42${String(index).padStart(2, '0')}`,
        featuredCredits: 3,
        nextBillingAt,
      },
      update: {
        billingCycle,
        nextBillingAt,
        status: 'ACTIVE',
        featuredCredits: 3,
      },
    });
    await prisma.premiumPayment.create({
      data: {
        userId,
        gatewayId: `seed_pix_${index + 1}`,
        billingCycle,
        amountCents: 3000,
        status: 'PAID',
        expiresAt: nextBillingAt,
        paidAt: new Date(),
      },
    });
  }
}

/**
 * Metade dos organizadores tem organização; a outra metade publica em nome
 * próprio (mestrandos, TCC), que é o caso que o schema passou a suportar.
 */
const ORGANIZERS_WITH_ORGANIZATION = 10;

/**
 * Metade publica pela organização (índices < 10) e metade em nome próprio
 * (índices >= 10), para as duas formas ficarem representadas na listagem.
 */
const OPPORTUNITY_AUTHOR_INDEXES = [0, 1, 2, 10, 11, 12];

const opportunityTemplates = [
  {
    title: 'Desenvolvimento de painel de visualização de dados',
    description:
      'Colaboração no desenvolvimento de um painel para acompanhar indicadores de um projeto de pesquisa. O trabalho tem impacto direto em uma publicação científica e pode compor portfólio.',
    type: OpportunityType.VOLUNTEER,
    modality: Modality.HYBRID,
    weeklyHours: 10,
    skills: ['React', 'TypeScript', 'UX Research'],
  },
  {
    title: 'Identidade visual para projeto social',
    description:
      'Redesign da identidade visual usada na comunicação digital da iniciativa, incluindo paleta, tipografia e aplicação em peças para redes sociais.',
    type: OpportunityType.VOLUNTEER,
    modality: Modality.REMOTE,
    weeklyHours: 8,
    skills: ['Figma', 'Design gráfico'],
  },
  {
    title: 'Análise de dados de pesquisa de campo',
    description:
      'Tratamento e análise exploratória das respostas coletadas em campo, com entrega de relatório e visualizações para a banca avaliadora.',
    type: OpportunityType.PAID,
    modality: Modality.ONSITE,
    weeklyHours: 20,
    skills: ['Pesquisa acadêmica', 'Comunicação'],
  },
  {
    title: 'Produção de conteúdo para blog institucional',
    description:
      'Escrita de artigos sobre educação e tecnologia para o blog da organização, com pauta definida em conjunto e revisão colaborativa.',
    type: OpportunityType.PAID,
    modality: Modality.REMOTE,
    weeklyHours: 5,
    skills: ['Redação', 'Marketing digital'],
  },
];

const applicationMessages = [
  'Tenho experiência prática com as competências pedidas e já desenvolvi projetos acadêmicos parecidos. Consigo dedicar a carga horária indicada.',
  'Estou buscando uma primeira experiência aplicada na área e tenho bastante disponibilidade para aprender durante o projeto.',
  'Já atuei em uma iniciativa parecida na universidade e gostaria de contribuir novamente com um projeto de impacto.',
  'Meu portfólio tem trabalhos diretamente relacionados ao escopo descrito. Fico à disposição para uma conversa.',
];

async function seedOrganizationProfiles(organizerIds: string[]) {
  for (let index = 0; index < ORGANIZERS_WITH_ORGANIZATION; index += 1) {
    const ownerUserId = organizerIds[index];
    if (!ownerUserId) continue;

    const name = faker.company.name();
    const data = {
      name,
      description: `${name} desenvolve projetos com estudantes e profissionais em formação.`,
      website: `https://${faker.internet.domainName()}`,
    };

    await prisma.organization.upsert({
      where: { ownerUserId },
      create: { ownerUserId, ...data },
      update: data,
    });
  }
}

async function seedOpportunities(organizerIds: string[]) {
  // Oportunidade não tem chave natural para upsert, então a seed recria as
  // vagas dos usuários de demonstração a cada execução (candidaturas caem
  // junto, por cascade). Vagas criadas por contas reais não são tocadas.
  await prisma.opportunity.deleteMany({
    where: { createdByUserId: { in: organizerIds } },
  });

  const ids: string[] = [];

  for (const [position, index] of OPPORTUNITY_AUTHOR_INDEXES.entries()) {
    const createdByUserId = organizerIds[index];
    if (!createdByUserId) continue;

    const organization = await prisma.organization.findUnique({
      where: { ownerUserId: createdByUserId },
      select: { id: true },
    });

    for (let slot = 0; slot < 2; slot += 1) {
      const template =
        opportunityTemplates[
          (position * 2 + slot) % opportunityTemplates.length
        ];

      const opportunity = await prisma.opportunity.create({
        data: {
          createdByUserId,
          organizationId: organization?.id ?? null,
          ...template,
          isFeatured: index < 4 && slot === 0,
          featuredAt: index < 4 && slot === 0 ? new Date() : null,
        },
        select: { id: true },
      });

      ids.push(opportunity.id);
    }
  }

  return ids;
}

async function syncSeedFeaturedCredits(organizerIds: string[]) {
  for (const userId of organizerIds.slice(0, 4)) {
    const usedCredits = await prisma.opportunity.count({
      where: { createdByUserId: userId, isFeatured: true },
    });
    await prisma.premiumSubscription.update({
      where: { userId },
      data: { featuredCredits: Math.max(0, 3 - usedCredits) },
    });
  }
}

async function seedApplications(opportunityIds: string[], talentIds: string[]) {
  const statuses = [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
  ];
  let created = 0;

  for (const opportunityId of opportunityIds) {
    const applicants = faker.helpers.arrayElements(talentIds, {
      min: 2,
      max: 4,
    });

    for (const [position, talentUserId] of applicants.entries()) {
      const message =
        applicationMessages[position % applicationMessages.length];
      const status = statuses[position % statuses.length];

      await prisma.application.upsert({
        where: {
          opportunityId_talentUserId: { opportunityId, talentUserId },
        },
        create: { opportunityId, talentUserId, message, status },
        update: { message, status },
      });

      created += 1;
    }
  }

  return created;
}

async function main() {
  faker.seed(20260905);

  await seedTalents();
  await seedOrganizations();
  await seedAdmin();

  const talentEmails = Array.from(
    { length: RECORDS_PER_PROFILE_TYPE },
    (_, index) => seedEmail('talento', index + 1),
  );
  const organizationEmails = Array.from(
    { length: RECORDS_PER_PROFILE_TYPE },
    (_, index) => seedEmail('organizacao', index + 1),
  );

  const [organizerUsers, talentUsers] = await Promise.all([
    prisma.user.findMany({
      where: { email: { in: organizationEmails } },
      select: { id: true, email: true },
    }),
    prisma.user.findMany({
      where: { email: { in: talentEmails } },
      select: { id: true, email: true },
    }),
  ]);

  // Ordena pelo e-mail para o vínculo organizador ↔ vaga não depender da
  // ordem de retorno do banco.
  const organizerIds = organizerUsers
    .sort((a, b) => a.email.localeCompare(b.email))
    .map((user) => user.id);
  const talentIds = talentUsers
    .sort((a, b) => a.email.localeCompare(b.email))
    .map((user) => user.id);

  await seedOrganizationProfiles(organizerIds);
  await seedPremiumSubscriptions(organizerIds);
  const opportunityIds = await seedOpportunities(organizerIds);
  await syncSeedFeaturedCredits(organizerIds);
  const applications = await seedApplications(opportunityIds, talentIds);

  const [talentProfiles, organizations] = await Promise.all([
    prisma.talentProfile.count({
      where: { user: { email: { in: talentEmails } } },
    }),
    prisma.organization.count(),
  ]);

  console.log('Seed concluída:');
  console.log(`- ${talentIds.length} talentos`);
  console.log(`- ${organizerIds.length} organizadores`);
  console.log(`- ${talentProfiles} perfis de talento`);
  console.log(`- ${organizations} organizações`);
  console.log(`- ${opportunityIds.length} oportunidades`);
  console.log(`- ${applications} candidaturas`);
  console.log(`Senha dos usuários de demonstração: ${SEED_PASSWORD}`);
  console.log(`Administrador: ${ADMIN_EMAIL}`);
}

main()
  .catch((error: unknown) => {
    console.error('Falha ao executar a seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
