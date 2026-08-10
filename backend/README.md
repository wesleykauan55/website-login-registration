# Backend do site — login, cadastro e comentários

## 1. Instalar o MySQL localmente

Mais fácil pra começar: instale o **XAMPP** ou **Laragon** (Windows) — ambos já vêm com MySQL
e um painel (phpMyAdmin) pra você rodar o script SQL visualmente.

## 2. Criar o banco

Abra o phpMyAdmin (ou o cliente MySQL que preferir) e rode o conteúdo de `sql/schema.sql`.
Isso cria o banco `site_db` com as tabelas `users` e `comments`.

## 3. Configurar o projeto

```bash
cd backend
npm install
cp .env.example .env
```

Abra o `.env` e preencha `DB_USER`, `DB_PASSWORD` (o do seu MySQL local) e troque o `JWT_SECRET`
por uma string aleatória grande.

## 4. Rodar o servidor

```bash
npm run dev
```

Servidor sobe em `http://localhost:3000`. Teste em `http://localhost:3000/api/health`.

## 5. Criar seu usuário admin

1. Cadastre-se normalmente pelo formulário de registro do site (isso chama `/api/auth/register`).
2. No phpMyAdmin, rode:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'seuemail@email.com';
   ```
3. Faça login de novo — agora seu token vai carregar `role: "admin"`.

## 6. Rotas disponíveis

| Método | Rota                | Quem acessa      | Descrição                          |
|--------|---------------------|-------------------|-------------------------------------|
| POST   | /api/auth/register  | Qualquer um       | Cria conta (role padrão: `user`)   |
| POST   | /api/auth/login     | Qualquer um       | Login, seta cookie de sessão        |
| POST   | /api/auth/logout    | Logado            | Remove o cookie                     |
| GET    | /api/auth/me        | Logado            | Retorna dados do usuário logado     |
| POST   | /api/comments       | Qualquer um       | Envia um comentário                 |
| GET    | /api/comments        | Só admin          | Lista todos os comentários          |

## 7. Integrando com seu `script.js` (front-end)

Veja o arquivo `frontend-integration-example.js` — ele mostra como trocar os `<form action="#">`
atuais por chamadas reais à API, e como esconder/mostrar a área de comentários (na página que você
vai renomear pra "Contato") dependendo se o usuário logado é admin ou não.

⚠️ Lembre-se: `fetch(...)` precisa sempre de `credentials: "include"` pra o cookie de login
funcionar entre front e back.
