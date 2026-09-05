import { fakerPT_BR as faker } from '@faker-js/faker';
import { PrismaClient, UserRole } from '@prisma/client';
import { createHash, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

const RECORDS_PER_PROFILE_TYPE = 20;
const SEED_PASSWORD = 'Conecta@123';

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

async function main() {
  faker.seed(20260905);

  await seedTalents();
  await seedOrganizations();

  const talentEmails = Array.from(
    { length: RECORDS_PER_PROFILE_TYPE },
    (_, index) => seedEmail('talento', index + 1),
  );
  const organizationEmails = Array.from(
    { length: RECORDS_PER_PROFILE_TYPE },
    (_, index) => seedEmail('organizacao', index + 1),
  );

  const [talents, organizations, talentProfiles] = await Promise.all([
    prisma.user.count({ where: { email: { in: talentEmails } } }),
    prisma.user.count({ where: { email: { in: organizationEmails } } }),
    prisma.talentProfile.count({
      where: { user: { email: { in: talentEmails } } },
    }),
  ]);

  console.log('Seed concluída:');
  console.log(`- ${talents} talentos`);
  console.log(`- ${organizations} organizações`);
  console.log(`- ${talentProfiles} perfis de talento`);
  console.log(`Senha dos usuários de demonstração: ${SEED_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('Falha ao executar a seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
