# Deploy na VPS

Esta configuração considera:

- domínio `conectafreela.tech` apontando para `179.198.113.50`;
- Nginx instalado diretamente na VPS;
- aplicação executada pelo Docker Compose;
- portas 3000, 3333 e 5432 disponíveis somente no `localhost` da VPS.

## 1. Preparar as variáveis

No diretório do projeto na VPS:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

Troque `POSTGRES_PASSWORD` por uma senha longa e alfanumérica. Não envie o arquivo `.env.production` ao Git.

## 2. Subir a aplicação

```bash
docker compose --env-file .env.production up -d --build
docker compose ps
curl --fail http://127.0.0.1:3000/
curl --fail http://127.0.0.1:3333/api
```

As migrations são aplicadas automaticamente quando a API inicia.

## 3. Configurar o Nginx global

Em distribuições Debian ou Ubuntu:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/conectafreela.tech.conf /etc/nginx/sites-available/conectafreela.tech
sudo ln -s /etc/nginx/sites-available/conectafreela.tech /etc/nginx/sites-enabled/conectafreela.tech
sudo nginx -t
sudo systemctl reload nginx
```

Se o link já existir, não é necessário executar novamente o comando `ln -s`.

No firewall, mantenha públicas apenas as portas SSH, HTTP e HTTPS. Se o UFW já estiver ativo, libere o perfil do Nginx:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw status
```

Se ainda for ativar o UFW, libere antes a porta SSH realmente usada pela VPS para não perder o acesso remoto.

## 4. Ativar HTTPS

Confirme primeiro que o registro A público resolve para `179.198.113.50` e que `http://conectafreela.tech` responde. Depois execute:

```bash
sudo certbot --nginx -d conectafreela.tech --redirect
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

O Certbot adicionará ao virtual host o certificado, a chave e o redirecionamento permanente de HTTP para HTTPS.

## Atualizações posteriores

```bash
git pull --ff-only
docker compose --env-file .env.production up -d --build
```

Valide o deploy depois de cada atualização:

```bash
curl --fail --head https://conectafreela.tech/
curl --fail https://conectafreela.tech/api
docker compose ps
```

## Podman: falha de DNS interno

Se a API informar `P1001` para `postgres:5432` e os containers retornarem `EAI_AGAIN` ao resolver o alias `postgres`, recrie somente os containers e a rede do projeto:

```bash
docker compose --env-file .env.production down
podman network rm conectafreela_default 2>/dev/null || true
docker compose --env-file .env.production up -d --build
```

O comando não utiliza `--volumes`, portanto o volume com os dados do PostgreSQL é preservado.
