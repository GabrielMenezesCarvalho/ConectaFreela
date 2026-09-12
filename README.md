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

A seed cria 20 talentos, 20 organizadores, assinaturas Premium simuladas e oportunidades destacadas. Todos os usuários de demonstração usam a senha `Conecta@123`.

### Contas de demonstração por perfil

| Perfil | E-mail | Senha | Exemplo de uso |
| --- | --- | --- | --- |
| Talento | `talento.01@example.com` | `Conecta@123` | Feed personalizado, filtros, detalhes de oportunidades e perfil profissional |
| Organizador gratuito | `organizacao.05@example.com` | `Conecta@123` | Publicação e gestão de oportunidades, perfil da organização e oferta do Premium |
| Organizador Premium | `organizacao.01@example.com` | `Conecta@123` | Recursos Premium e até 3 oportunidades ativas destacadas por vez |
| Administrador | `admin@conectafreela.com.br` | `Conecta@123` | Dashboard administrativo e métricas de monetização |

Também estão disponíveis `talento.01@example.com` até `talento.20@example.com` e `organizacao.01@example.com` até `organizacao.20@example.com`. Os organizadores `01` a `04` possuem assinatura Premium ativa criada pela seed.

Essas credenciais são exclusivas para demonstração e desenvolvimento. Não reutilize a senha da seed em contas reais.

## Monetização e Premium

- Plano Premium: R$ 30,00 por mês, com taxa operacional de R$ 0,80 absorvida pela plataforma.
- Meta de rentabilidade: 12 assinaturas mensais (R$ 360,00 brutos e R$ 350,40 após as taxas de pagamento).
- `/organizacao/premium`: apresenta os benefícios e planos para organizadores.
- `/organizacao/premium/assinar`: gera um PIX pela AbacatePay e ativa o Premium somente após a confirmação do pagamento.
- No painel do organizador, assinantes Premium podem destacar oportunidades ativas.
- `/oportunidades`: prioriza destaques compatíveis com as habilidades do talento.
- `/oportunidades/:id`: exibe todos os detalhes e prepara o fluxo de candidatura.
- `/admin`: mostra ativação, conversão Premium, retenção, receita recorrente, transações e adoção de destaques.

A API exige `ABACATEPAY_API_KEY` no ambiente do servidor. Chaves `abc_dev_...` habilitam o botão de simulação do pagamento no sandbox; a chave nunca deve ser exposta como variável `NEXT_PUBLIC_*`.

## Deploy em produção

O projeto inclui configuração para publicar `conectafreela.tech` usando o Nginx global da VPS como proxy reverso. Consulte [deploy/VPS.md](deploy/VPS.md) para preparar as variáveis, subir os containers e emitir o certificado HTTPS.
