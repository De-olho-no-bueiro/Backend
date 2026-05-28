# De Olho no Bueiro API

API em NestJS + Prisma que atende o aplicativo mobile, o portal web e os fluxos administrativos do ecossistema De Olho no Bueiro.

## O que este projeto entrega

- Autenticação para mobile e web
- Cadastro e leitura de reportes de alagamentos e bueiros
- Comentários, likes e verificação de ocorrências
- Perfil do usuário autenticado
- Upload com URL pré-assinada para storage compatível com S3
- Endpoints públicos para consumo do portal web
- Documentação interativa da API em `/api/docs` fora de produção, ou com `ENABLE_API_DOCS=true`

## Stack

- NestJS
- Prisma
- PostgreSQL
- TypeScript
- JWT

## Estrutura resumida

```text
src/
├─ main.ts
├─ prisma/
└─ modules/
   ├─ auth/
   ├─ comments/
   ├─ reportes/
   ├─ uploads/
   └─ users/
```

## Requisitos

- Node.js 20+
- npm 10+ ou pnpm 9+
- Docker e Docker Compose para subir o PostgreSQL local

## Variáveis de ambiente

Crie um arquivo `.env` na raiz de `Backend/`.

Exemplo mínimo para desenvolvimento:

```env
PORT=3001
NODE_ENV=development
ENABLE_API_DOCS=true

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=de_olho_no_bueiro

DATABASE_URL=postgresql://postgres:postgres@localhost:5494/de_olho_no_bueiro?schema=public
APP_DATABASE_URL=postgresql://postgres:postgres@localhost:5494/de_olho_no_bueiro?schema=public

JWT_SECRET=troque-esta-chave-em-producao
ADMIN_EMAILS=admin@exemplo.com

UPLOAD_MAX_FILES=6
UPLOAD_MAX_FILE_SIZE_BYTES=8388608
UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

S3_ACCESS_KEY_ID=local-access-key
S3_SECRET_ACCESS_KEY=local-secret-key
S3_BUCKET=de-olho-no-bueiro
S3_REGION=us-east-1
S3_ENDPOINT=https://storage.exemplo.com
S3_PUBLIC_BASE_URL=https://storage.exemplo.com/de-olho-no-bueiro
```

Observações:

- A API usa `PORT=3001` por padrão.
- A conexão com banco aceita `APP_DATABASE_URL` ou `DATABASE_URL`.
- Sem `JWT_SECRET` a API não sobe.
- Os uploads dependem de um provedor S3 compatível.

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Suba o PostgreSQL local:

```bash
docker compose up -d
```

3. Aplique as migrations:

```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

Se estiver evoluindo o schema localmente, pode usar:

```bash
npx prisma migrate dev --schema=src/prisma/schema.prisma
```

4. Inicie a API em modo de desenvolvimento:

```bash
npm run start:dev
```

5. Acesse:

- API: `http://localhost:3001/api`
- Docs: `http://localhost:3001/api/docs`

## Endpoints principais

Com o prefixo global `/api`:

- Público web:
  - `GET /public/v1/reportes`
  - `GET /public/v1/manholes`
  - `GET /public/v1/flood-areas`
- Mobile:
  - `POST /mobile/v1/auth/signup`
  - `POST /mobile/v1/auth/login`
  - `GET /mobile/v1/reportes`
  - `POST /mobile/v1/reportes`
  - `GET /mobile/v1/manholes`
  - `GET /mobile/v1/flood-areas`
- Web administrativo:
  - `POST /web/v1/auth/login`
  - `GET /web/v1/reportes`
  - `GET /web/v1/manholes`
  - `GET /web/v1/flood-areas`

## Scripts úteis

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
npm run test:cov
```

## Banco de dados

- Prisma schema: `src/prisma/schema.prisma`
- Migrations: `src/prisma/migrations/`
- Container local padrão: `api-do-bueiro-postgres`
- Porta local do PostgreSQL: `5494`

## Integração com os outros projetos

- `frontend-web` espera a API em `http://localhost:3001/api`
- `de-olho-no-bueiro-mobile` deve apontar `EXPO_PUBLIC_API_URL` para esta API

No Android Emulator, normalmente o backend deve ser acessado por `http://10.0.2.2:3001/api` em vez de `localhost`.

## Contribuição

Este projeto foi preparado para colaboração aberta. Leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de abrir PR.
