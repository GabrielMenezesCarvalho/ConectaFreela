# ConectaFreela

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

Com Docker:

```powershell
docker compose up --build
```

Para desenvolvimento local com hot reload:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
npm install
npm run db:generate
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3333/api

O schema do Prisma contém os usuários e perfis de talento. Para criar novas migrations, execute:

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
npm run db:seed
npm run db:studio
npx shadcn@latest add button
docker compose up -d postgres
docker compose down
```

## Cadastro e perfil de usuário

- `POST /api/users`: cadastra talento ou organização.
- `GET /api/users/:id`: consulta os dados públicos do usuário.
- `PATCH /api/users/:id/talent-profile`: atualiza competências, disponibilidade, bio e portfólio do talento.

Login, logout e autorização ficam reservados para a história específica de autenticação.

## Dados de demonstração

Com o PostgreSQL em execução, popule o banco com dados reproduzíveis:

```powershell
npm run db:seed
```

A seed cria 20 talentos com seus respectivos perfis e 20 organizações. Os usuários de demonstração usam e-mails no formato `talento.01@example.com` ou `organizacao.01@example.com` e a senha `Conecta@123`.

## Deploy em produção

O projeto inclui configuração para publicar `conectafreela.tech` usando o Nginx global da VPS como proxy reverso. Consulte [deploy/VPS.md](deploy/VPS.md) para preparar as variáveis, subir os containers e emitir o certificado HTTPS.
