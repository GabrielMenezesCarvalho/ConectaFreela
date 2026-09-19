<div align="center">
  <img src="./apps/web/src/assets/landing/icone-cf.png" alt="Ícone do ConectaFreela" width="112" />
  <br />
  <img src="./apps/web/src/assets/landing/connectafreela.png" alt="ConectaFreela" width="520" />

  <p>
    Plataforma que aproxima talentos de oportunidades profissionais, acadêmicas e voluntárias.
  </p>

  <p>
    <a href="http://conectafreela.tech"><strong>Acessar o projeto</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma 6" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
    <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
    <img src="https://img.shields.io/badge/Nginx-Proxy-009639?logo=nginx&logoColor=white" alt="Nginx" />
    <img src="https://img.shields.io/badge/Jest-Testes-C21325?logo=jest&logoColor=white" alt="Jest" />
  </p>
</div>

## Sobre o projeto

O **ConectaFreela** conecta pessoas que desejam desenvolver experiência e portfólio a organizações, projetos sociais, iniciativas acadêmicas e empresas que precisam de talentos. A plataforma reúne descoberta de oportunidades, candidaturas, acompanhamento de status e comunicação em um único ambiente.

O produto atende três perfis:

- **Talento:** cria um perfil profissional, encontra oportunidades compatíveis, candidata-se e conversa com organizadores.
- **Organizador:** publica oportunidades, avalia candidaturas, libera conversas e pode destacar vagas com o plano Premium.
- **Administrador:** acompanha indicadores de ativação, conversão, receita e adoção dos recursos da plataforma.

## Funcionalidades

### Para talentos

- Cadastro, login e perfil com biografia, habilidades, disponibilidade e portfólio.
- Busca de oportunidades voluntárias ou remuneradas, presenciais, remotas ou híbridas.
- Recomendação e prioridade de vagas conforme as habilidades informadas.
- Envio e retirada de candidaturas.
- Acompanhamento do status de cada candidatura.
- Chat com o organizador após a conversa ser liberada.
- Indicador de mensagens não lidas.

### Para organizadores

- Perfil próprio ou vinculado a uma organização.
- Publicação e gerenciamento de oportunidades.
- Consulta aos perfis e portfólios dos candidatos.
- Aprovação ou recusa de candidaturas.
- Liberação de conversas com talentos selecionados.
- Assinatura Premium via PIX com a AbacatePay.
- Créditos para destacar oportunidades no feed dos talentos.

### Para administradores

- Dashboard com métricas de ativação e retenção.
- Indicadores de conversão Premium e receita recorrente.
- Acompanhamento de pagamentos e uso de destaques.

## Tecnologias

| Camada         | Tecnologias                                                 |
| -------------- | ----------------------------------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript, Tailwind CSS 4 e Radix UI |
| Backend        | Node.js, NestJS 11 e validação com `class-validator`        |
| Dados          | PostgreSQL 16 e Prisma ORM 6                                |
| Pagamentos     | API PIX da AbacatePay                                       |
| Testes         | Jest e ts-jest                                              |
| Infraestrutura | Docker, Docker Compose e Nginx                              |

## Diagrama de casos de uso

```mermaid
flowchart LR
    talent((Talento))
    organizer((Organizador))
    admin((Administrador))
    payment((AbacatePay))

    subgraph platform ["Plataforma ConectaFreela"]
        account(["Criar conta e entrar"])
        profile(["Gerenciar perfil"])
        discover(["Buscar oportunidades"])
        apply(["Enviar ou retirar candidatura"])
        track(["Acompanhar candidatura"])
        chat(["Trocar mensagens"])
        publish(["Publicar oportunidade"])
        review(["Analisar candidaturas"])
        enableChat(["Liberar conversa"])
        subscribe(["Assinar Premium"])
        feature(["Destacar oportunidade"])
        metrics(["Consultar métricas"])
    end

    talent --> account
    talent --> profile
    talent --> discover
    talent --> apply
    talent --> track
    talent --> chat

    organizer --> account
    organizer --> profile
    organizer --> publish
    organizer --> review
    organizer --> enableChat
    organizer --> chat
    organizer --> subscribe
    organizer --> feature

    admin --> account
    admin --> metrics
    subscribe -.-> payment
```

## Fluxo do usuário

```mermaid
flowchart TD
    access(["Acessa a plataforma"])
    registered{"Possui conta?"}
    signup["Cria a conta e escolhe o perfil"]
    login["Informa e-mail e senha"]
    role{"Qual é o perfil?"}

    access --> registered
    registered -->|"Não"| signup
    registered -->|"Sim"| login
    signup --> role
    login --> role

    role -->|"Talento"| talentProfile["Completa o perfil profissional"]
    talentProfile --> search["Explora oportunidades"]
    search --> details["Consulta os detalhes"]
    details --> application["Envia a candidatura"]
    application --> follow["Acompanha o status"]
    follow --> availableChat{"Conversa liberada?"}
    availableChat -->|"Sim"| messages["Troca mensagens"]
    availableChat -->|"Não"| follow

    role -->|"Organizador"| organizerPanel["Acessa o painel"]
    organizerPanel --> publishOpportunity["Publica uma oportunidade"]
    publishOpportunity --> candidates["Recebe e avalia candidaturas"]
    candidates --> openConversation["Libera a conversa"]
    openConversation --> decision["Atualiza a decisão"]
    openConversation --> messages

    organizerPanel --> premium{"Deseja mais alcance?"}
    premium -->|"Sim"| pix["Gera e paga o PIX"]
    pix --> credits["Recebe créditos de destaque"]
    credits --> highlight["Destaca a oportunidade"]
    premium -->|"Não"| publishOpportunity

    role -->|"Administrador"| adminPanel["Consulta métricas da plataforma"]

    style role fill:#FFECBD,stroke:#FFC943
    style availableChat fill:#FFECBD,stroke:#FFC943
    style premium fill:#FFECBD,stroke:#FFC943
    style messages fill:#CDF4D3,stroke:#66D575
    style highlight fill:#CDF4D3,stroke:#66D575
```

## Arquitetura do sistema

```mermaid
flowchart LR
    subgraph client ["Cliente"]
        browser["Navegador web"]
    end

    subgraph gateway ["VPS"]
        nginx["Nginx e HTTPS"]
    end

    subgraph service ["Docker Compose"]
        web["Next.js 16 e React 19"]
        api["API REST NestJS 11"]
    end

    subgraph datastore ["Persistência"]
        postgres[(PostgreSQL 16)]
    end

    subgraph external ["Serviço externo"]
        abacate["AbacatePay"]
    end

    browser -->|"HTTPS"| nginx
    nginx -->|"Rotas web"| web
    nginx -->|"Rotas /api"| api
    api -->|"Prisma ORM"| postgres
    api -.->|"PIX e status"| abacate

    style client fill:#C2E5FF,stroke:#3DADFF
    style gateway fill:#D9D9D9,stroke:#B3B3B3
    style service fill:#CDF4D3,stroke:#66D575
    style datastore fill:#DCCCFF,stroke:#874FFF
    style external fill:#FFECBD,stroke:#FFC943
```

Em produção, o Nginx recebe as conexões públicas e encaminha `/` para o frontend e `/api` para o backend. Os serviços da aplicação e o PostgreSQL são executados em containers, e somente a API se comunica com o banco e com o provedor de pagamentos.

## Estrutura do projeto

```text
conectafreela/
├── apps/
│   ├── api/                 # API NestJS, Prisma, migrations e testes
│   └── web/                 # Aplicação Next.js e componentes React
├── deploy/
│   ├── nginx/               # Proxy reverso para produção
│   └── VPS.md               # Guia de deploy
├── postman/                 # Coleções para testar a API
├── docker-compose.yml       # Web, API e PostgreSQL
├── Dockerfile               # Imagens de produção
├── prisma.config.ts         # Configuração do Prisma
└── package.json             # Scripts e workspaces do monorepo
```

## Como executar localmente

### Pré-requisitos

- Node.js `20.19` ou superior.
- npm.
- Docker com Docker Compose.

### Desenvolvimento com hot reload

```bash
git clone https://github.com/GabrielMenezesCarvalho/ConectaFreela.git
cd ConectaFreela
cp .env.example .env
npm ci
docker compose up -d postgres
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Depois da inicialização:

| Serviço    | Endereço                                               |
| ---------- | ------------------------------------------------------ |
| Frontend   | [http://localhost:3000](http://localhost:3000)         |
| API        | [http://localhost:3333/api](http://localhost:3333/api) |
| PostgreSQL | `localhost:5433`                                       |

### Execução completa com Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

As migrations são aplicadas automaticamente na inicialização da API dentro do ambiente Docker.

## Variáveis de ambiente

Use [`.env.example`](.env.example) como base e nunca envie credenciais reais para o repositório.

| Variável              | Finalidade                                | Padrão local                                                                          |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Conexão da API com o PostgreSQL           | `postgresql://conectafreela:conectafreela@localhost:5433/conectafreela?schema=public` |
| `POSTGRES_PORT`       | Porta do PostgreSQL publicada no host     | `5433`                                                                                |
| `PORT`                | Porta da API                              | `3333`                                                                                |
| `WEB_PORT`            | Porta do frontend                         | `3000`                                                                                |
| `WEB_URL`             | Origem permitida pelo CORS da API         | `http://localhost:3000`                                                               |
| `NEXT_PUBLIC_API_URL` | URL pública consumida pelo frontend       | `http://localhost:3333/api`                                                           |
| `ABACATEPAY_API_KEY`  | Chave privada da integração de pagamentos | obrigatória para pagamentos                                                           |

> Chaves `abc_dev_...` habilitam a simulação de pagamentos no sandbox. A chave da AbacatePay deve permanecer somente no servidor e nunca usar o prefixo `NEXT_PUBLIC_`.

## Dados de demonstração

Com o PostgreSQL em execução, use `npm run db:seed` para criar dados reproduzíveis. A seed inclui 20 talentos, 20 organizadores, assinaturas Premium simuladas e oportunidades destacadas.

| Perfil               | E-mail                       | Senha         | Acesso principal                                |
| -------------------- | ---------------------------- | ------------- | ----------------------------------------------- |
| Talento              | `talento.01@example.com`     | `Conecta@123` | Oportunidades, candidaturas, perfil e mensagens |
| Organizador gratuito | `organizacao.05@example.com` | `Conecta@123` | Publicação e gestão de oportunidades            |
| Organizador Premium  | `organizacao.01@example.com` | `Conecta@123` | Créditos e destaque de oportunidades            |
| Administrador        | `admin@conectafreela.com.br` | `Conecta@123` | Dashboard administrativo                        |

Também estão disponíveis os usuários `talento.01@example.com` até `talento.20@example.com` e `organizacao.01@example.com` até `organizacao.20@example.com`. Os organizadores de `01` a `04` possuem assinatura Premium ativa.

> Essas credenciais são exclusivas para demonstração e desenvolvimento. Não reutilize a senha da seed em contas reais.

## Scripts disponíveis

| Comando                             | Descrição                                        |
| ----------------------------------- | ------------------------------------------------ |
| `npm run dev`                       | Inicia frontend e API em modo de desenvolvimento |
| `npm run dev:web`                   | Inicia somente o frontend                        |
| `npm run dev:api`                   | Inicia somente a API                             |
| `npm run build`                     | Compila API e frontend para produção             |
| `npm run lint`                      | Executa o ESLint nos workspaces                  |
| `npm test`                          | Executa os testes da API                         |
| `npm run db:generate`               | Gera o Prisma Client                             |
| `npm run db:migrate -- --name nome` | Cria e aplica uma migration                      |
| `npm run db:seed`                   | Popula o banco com dados de demonstração         |
| `npm run db:studio`                 | Abre o Prisma Studio                             |

## Principais recursos da API

A API utiliza o prefixo `/api` e está organizada nos seguintes módulos:

| Recurso          | Responsabilidade                                         |
| ---------------- | -------------------------------------------------------- |
| `/auth`          | Validação de login                                       |
| `/users`         | Cadastro e perfis de usuário                             |
| `/organizations` | Dados das organizações                                   |
| `/opportunities` | Publicação, listagem, status e destaque de oportunidades |
| `/applications`  | Candidaturas e decisões                                  |
| `/conversations` | Conversas, mensagens e contagem de não lidas             |
| `/premium`       | Assinaturas, pagamentos PIX e créditos                   |
| `/admin`         | Métricas administrativas                                 |

## Testes e qualidade

```bash
npm test
npm run build
```

Os testes automatizados cobrem os principais serviços da API, incluindo autenticação, usuários, oportunidades, candidaturas, conversas e Premium.

## Deploy

URL do projeto: [http://conectafreela.tech](http://conectafreela.tech).

Para configurar uma nova VPS, variáveis de produção, containers, Nginx e HTTPS, consulte o [guia de deploy](deploy/VPS.md).
