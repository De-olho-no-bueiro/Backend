# Contribuindo com a API

Este projeto aceita contribuições em arquitetura, performance, segurança, testes, integração e documentação.

## Antes de abrir um PR

- Verifique se já existe issue ou PR relacionado
- Se a mudança alterar contrato da API, banco ou autenticação, descreva o impacto
- Prefira PRs pequenos e objetivos

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Configure o arquivo `.env` com banco, JWT e storage

3. Suba o PostgreSQL:

```bash
docker compose up -d
```

4. Aplique as migrations:

```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

5. Rode a API:

```bash
npm run start:dev
```

## Fluxo recomendado

1. Faça fork do repositório
2. Crie uma branch:

```bash
git checkout -b feat/melhoria-na-api
```

3. Implemente
4. Valide localmente
5. Abra o PR com contexto e passos para teste

## Checklist de validação

Antes de enviar:

```bash
npm run lint
npm run test
npm run build
```

Também valide manualmente:

- autenticação mobile e web, se afetadas
- rotas públicas e administrativas alteradas
- migrations e acesso ao banco, quando houver mudança de schema
- fluxo de upload, se tocar em storage

## Padrões esperados

- Preserve a separação por módulos e camadas
- Evite misturar regra de negócio com controller
- Não introduza dependências sem necessidade clara
- Mantenha compatibilidade com o schema Prisma e contratos expostos
- Prefira correções incrementais em vez de refactors extensos sem contexto

## Quando atualizar documentação

Atualize o `README.md` se houver mudança em:

- setup local
- variáveis de ambiente
- comandos de execução
- endpoints, autenticação ou comportamento da API
- integração com banco, upload ou outros serviços

## O que ajuda bastante em um PR

- descrição do problema
- solução adotada
- riscos conhecidos
- passos exatos para testar
- exemplos de request/response quando a API mudar
