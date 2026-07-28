# TrackSpend

App web para gerir despesas partilhadas entre 2-3 pessoas (ex: casal, casa partilhada), substituindo uma folha de Excel com totais automáticos, orçamento previsto vs. real, gráficos e acerto de contas.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + React Router + Axios + Recharts
- **Backend:** Node.js + Express + TypeScript + MongoDB/Mongoose + JWT + bcrypt
- **Hosting sugerido:** Vercel (frontend), Railway (backend), MongoDB Atlas (free tier)

## Estrutura

```
backend/   API REST (Express + Mongoose)
frontend/  SPA (Vite + React)
```

## Correr localmente

### 1. Base de dados

Cria um cluster grátis em [MongoDB Atlas](https://mongodb.com/cloud) e copia a connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edita .env com o DATABASE_URL e um JWT_SECRET
npm install
npm run dev
```

API disponível em `http://localhost:4000/api` (health check em `/api/health`).

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App disponível em `http://localhost:5173`.

## Fluxo

1. Registo/login (JWT guardado em `localStorage`)
2. Criar ou entrar num grupo (ex: "Casa")
3. Adicionar despesas (categoria, tipo fixa/variável, valor, data)
4. Ver dashboard (tabela tipo Excel com totais e diferença face ao previsto)
5. Configurar orçamento previsto e regra de divisão nas Definições
6. Ver gráficos (por categoria, por pessoa, evolução anual)
7. Registar acertos de contas entre membros (via API `/api/grupos/:id/acertos`)

## Notas

- Sem WebSocket — não é necessário para 2-3 utilizadores.
- Categorias são soft-deleted (campo `ativo`) para preservar despesas históricas.
- O bundle do frontend inclui Recharts e passa dos 500kB minificados; para produção considerar `dynamic import()` das páginas de gráficos se isso importar.
