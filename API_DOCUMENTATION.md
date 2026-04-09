# Documentação da API - De Olho no Bueiro

Abaixo está o descritivo de todas as rotas e funções disponíveis no Backend de acordo com os _Controllers_ atuais. Essa API é construída em NestJS. A aplicação geral é voltada tanto para o aplicativo mobile (recebimento de novos relatos, cadastro) quanto para o painel web admin (visualização agregada dos dados e gestão).

---

## 📱 Mobile API (Autenticação)
**Caminho Base:** `/mobile/v1/auth`

### `POST /signup`
- **Função:** Cadastrar um novo usuário (Mobile).
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "João da Silva",
    "email": "user@exemplo.com",
    "password": "senhaForte123"
  }
  ```
- **Retorno Esperado:** Status 201 - Usuário cadastrado com sucesso (sem a senha trafegando).

### `POST /login`
- **Função:** Fazer login pelo Aplicativo Móvel.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "user@exemplo.com",
    "password": "senhaForte123"
  }
  ```
- **Retorno Esperado:** Status 200 - Contém metadados do usuário e o `access_token` JWT.

### `POST /forgot-password`
- **Função:** Solicitar link ou token para reset de senha (ainda a ser inteiramente integrado com enviadores de e-mail).
- **Corpo da Requisição (JSON):** Requires o `email` (conforme `ForgotPasswordDto`).
- **Retorno Esperado:** Status 200 - Link/Token de recuperação gerado.

### `POST /reset-password`
- **Função:** Resetar a senha usando o token recuperado.
- **Corpo da Requisição (JSON):** Requires o `token` e `newPassword` (conforme `ResetPasswordDto`).
- **Retorno Esperado:** Status 200 - Senha alterada com sucesso.

---

## 📱 Mobile API (Reportes Simples / Alagamentos)
**Caminho Base:** `/mobile/v1/reportes`

### `GET /`
- **Função:** Listar todos os Reportes/Alagamentos simples criados pelo aplicativo.
- **Atributos:** Sem atributos obrigatórios. Retorna uma lista em JSON com latitude, longitude, nível, etc.

### `POST /`
- **Função:** Criar um novo Reporte.
- **Corpo da Requisição (Exemplo simplificado via Body):**
  ```json
  {
    "id": "uuid",
    "tipo": "alagamento",
    "latitude": -23.12345,
    "longitude": -46.12345,
    "endereco": "Rua Exemplo, 123",
    "nivel": "baixo",
    "descricao": "Bairro todo alagado.",
    "fotoUri": "url_da_foto.jpg",
    "dataHora": "2026-04-09T14:00:00Z"
  }
  ```

---

## 📱 Mobile API (Bueiros)
**Caminho Base:** `/mobile/v1/manholes`

### `GET /`
- **Função:** Listar todos os Bueiros registrados.
- **Atributos:** Sem atributos.

### `POST /`
- **Função:** Cadastrar a localização de um novo bueiro problemático ou em observação.
- **Corpo da Requisição (Exemplo abstrato):**
  ```json
  {
    "latitude": -23.12345,
    "longitude": -46.12345,
    "descricao": "Bueiro sem tampa",
    "dataHora": "2026-04-09T14:00:00Z"
  }
  ```

---

## 📱 Mobile API (Áreas de Alagamento via Polígonos)
**Caminho Base:** `/mobile/v1/flood-areas`

### `GET /`
- **Função:** Listar Áreas Poligonais de Alagamento.
- **Atributos:** Sem atributos.

### `POST /`
- **Função:** Criar uma delimitação (Área de Alagamento).
- **Corpo da Requisição (Exemplo de entrada):** Array de coordenadas indicando as pontas da área.
  ```json
  {
    "coordinates": [
      { "latitude": -23.1, "longitude": -46.1 },
      { "latitude": -23.2, "longitude": -46.2 },
      { "latitude": -23.3, "longitude": -46.3 }
    ],
    "nivel": "grave",
    "descricao": "Área de inundação completa",
    "dataHora": "2026-04-09T14:00:00Z"
  }
  ```

---

## 📱 Mobile API (Comentários)
**Caminho Base:** `/mobile/v1/comments`

*Rotas que exigem Autenticação (Bearer Token)*

### `POST /:postId`
- **Função:** Adicionar um novo comentário a um Reporte/Bueiro/Área (Post genérico).
- **Parâmetros da Rota:** `postId` (ID Numérico do Post-Alvo)
- **Corpo da Requisição (JSON):**
  ```json
  {
    "content": "Muito perigoso esse buraco, passei aí ontem e rasgou meu pneu!"
  }
  ```
- **Retorno Esperado:** O objeto Comment recém-criado aninhado com `{ author: { name, profilePicture } }`.

### `GET /:postId`
- **Função:** Buscar todos os comentários que os usuários fizeram na postagem alvo.
- **Retorno Esperado:** Status 200 - Lista em ordem cronológica de comentários pertencente a ele.

---

## 💻 Web Admin API (Visão Consolidada Geral)
**Caminho Base:** `/web/v1/reportes`

### `GET /`
- **Função:** Listar todos os reportes no painel administrativo combinados.
- **Retorno Esperado:** 
  ```json
  {
    "reportes": [...],
    "manholes": [...],
    "areas": [...]
  }
  ```
- *Nota: Rota voltada para ser consumida preferencialmente no Dashboard Web (Próxima Fase).*

---

## 👤 Users Management API (Interno / Admin CRUD)
**Caminho Base:** `/users`

*(Essas rotas são um CRUD nativo de gerenciamento de usuários. Para apps externos, utilize a rota Mobile Auth)*

### `POST /`
- **Função:** Forçar a criação de um usuário (Admin/Backend Only).
- **Corpo:**
  ```json
  {
    "email": "user@example.com",
    "name": "Opcional"
  }
  ```

### `GET /`
- **Função:** Listar __todos__ os usuários no banco de dados.

### `GET /:id`
- **Função:** Buscar os detalhes de um usuário específico sabendo o ID.

### `PATCH /:id`
- **Função:** Atualizar dados do usuário.

### `DELETE /:id`
- **Função:** Deletar usuário (204 NO CONTENT).

---

## 📊 Health Check (Rota Básica)
**Caminho Base:** `/`

### `GET /`
- **Função:** Rota de teste. Retorna "Hello World" ou checa conectividade para serviços de deploy (render, heroku, aws).
