# Deploy — GS Eletrotécnica

Arquitetura recomendada:
- **Railway** — banco de dados PostgreSQL
- **Vercel** — aplicação Next.js completa (frontend + server actions + API)

---

## 1. Banco de dados no Railway

1. Acesse [railway.app](https://railway.app) e crie um novo projeto
2. Clique em **+ New** → **Database** → **PostgreSQL**
3. Após provisionado, vá em **Variables** e copie o valor de `DATABASE_URL`
   - Formato: `postgresql://postgres:SENHA@HOST:PORT/railway`
4. Guarde essa URL — você vai usá-la na Vercel

---

## 2. Deploy na Vercel

### 2.1 Importar o repositório

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório `gabslee/GS-manager`
3. Framework: **Next.js** (detectado automaticamente)
4. Build Command: deixe o padrão (`npm run build`) — já inclui `prisma generate`
5. **Não faça o deploy ainda** — configure as variáveis primeiro

### 2.2 Variáveis de ambiente

Em **Settings → Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | URL copiada do Railway (passo 1.3) |
| `AUTH_SECRET` | Gere com: `openssl rand -base64 32` |
| `MOCK_DB` | `false` |

> Para gerar o `AUTH_SECRET` localmente rode:
> ```bash
> openssl rand -base64 32
> ```

### 2.3 Fazer o deploy

Clique em **Deploy**. O build irá:
1. Instalar dependências
2. Rodar `prisma generate` (gera o client Prisma)
3. Rodar `next build`

---

## 3. Rodar migrations e seed (uma única vez)

Após o primeiro deploy, execute os comandos abaixo **na sua máquina local** apontando para o banco do Railway:

```bash
# Copie a DATABASE_URL do Railway para o .env local temporariamente
# ou exporte diretamente:
export DATABASE_URL="postgresql://postgres:SENHA@HOST:PORT/railway"

# Rodar as migrations
npx prisma migrate deploy

# Criar usuários iniciais (gerente + atendente, senha: gs@2024)
npx prisma db seed
```

Credenciais criadas pelo seed:
| Usuário | Senha |
|---------|-------|
| gerente@gseletrotecnica.com.br | gs@2024 |
| atendente@gseletrotecnica.com.br | gs@2024 |

> **Troque as senhas** após o primeiro login em produção.

---

## 4. Variáveis completas de referência

```env
# Banco (Railway)
DATABASE_URL="postgresql://postgres:SENHA@HOST:PORT/railway"

# NextAuth
AUTH_SECRET="seu-secret-gerado-aqui"

# Desligar modo mock (obrigatório em produção)
MOCK_DB=false
```

---

## 5. Deploys futuros

Todo `git push` na branch `main` dispara um novo deploy automático na Vercel.

Para aplicar novas migrations após mudanças no schema:
```bash
export DATABASE_URL="..."
npx prisma migrate deploy
```
