# SkillSync Quick Start

## 1. Install Everything

```bash
npm run install-all
```

## 2. Add Environment Files

`backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=change_this_to_a_random_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

`ai-service/.env` is optional for LLM feedback:

```env
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

## 3. Start The App

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## What Runs

- `backend` handles auth, resumes, saved data, reports, and API routes.
- `frontend` is the React/Vite user interface.
- `ai-service` handles resume scoring, semantic similarity, skill extraction, and AI interview endpoints.

Use `ai-service` as the only Python AI service.
