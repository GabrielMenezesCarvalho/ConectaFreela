# ConectaFreela — starter

Base técnica do projeto

## Estrutura

```text
apps/
  api/       NestJS + Prisma
  web/       Next.js + React + TypeScript + Tailwind CSS + shadcn/ui
docker-compose.yml  PostgreSQL local
Dockerfile          Imagens de produção para API e frontend
```

## Primeira execução

No PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
npm install
npm run db:generate
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3333

O schema do Prisma está vazio. Quando a equipe definir o modelo de domínio, adicione os models em `apps/api/prisma/schema.prisma` e execute:

```powershell
npm run db:migrate -- --name init
```

## Comandos úteis

```powershell
npm run dev
npm run dev:web
npm run dev:api
npm run build
npm run lint
npm run test
npm run db:generate
npm run db:migrate -- --name nome_da_migration
npm run db:studio
npx shadcn@latest add button
docker compose up -d postgres
docker compose down
```
