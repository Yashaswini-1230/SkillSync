# SkillSync - Resume Analysis Platform

SkillSync is a MERN + FastAPI application for resume upload, ATS analysis, skill matching, resume building, job search, and interview practice.

## Features

- User authentication with JWT
- PDF/DOCX resume upload and parsing
- ATS resume analysis with matching and missing skills
- FastAPI AI service for semantic similarity, skill extraction, resume feedback, and interview AI
- Resume builder with live preview
- Job search integration
- PDF analysis reports
- Dashboard and profile management

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO client

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Multer file uploads
- PDF/DOCX parsing

### AI Service
- FastAPI
- spaCy for resume parsing and basic NLP
- Custom skill extractor for technical skills
- sentence-transformers for semantic resume/job-description similarity
- Optional Gemini/OpenAI-style LLM feedback through environment keys

## Project Structure

```text
skillsync/
  ai-service/
    main.py
    routers/
    services/
  backend/
    models/
    routes/
    middleware/
    services/
    utils/
    server.js
  frontend/
    src/
    index.html
  package.json
```

`ai-service` is the single Python AI service for this project.

## Installation

Install Node and Python dependencies:

```bash
npm run install-all
```

Or install separately:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=change_this_to_a_random_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
RAPIDAPI_KEY=
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Create `ai-service/.env` only if you want optional LLM feedback:

```env
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

## Run The Project

From the root folder:

```bash
npm run dev
```

This starts:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- AI service: `http://127.0.0.1:8000`

## API Overview

### Backend
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/resumes/upload`
- `POST /api/analysis`
- `GET /api/analysis`
- `GET /api/analysis/:id/download`
- `POST /api/interview/generate`

### AI Service
- `POST /api/analyzer/score`
- `POST /api/resume/parse`
- `POST /api/interview/generate-questions`
- `POST /api/interview/evaluate-answer`

## Important Notes

- Use `ai-service` for all Python AI/ML logic.
- Put all Python AI/ML changes inside `ai-service`.
- Keep real API keys only in local `.env` files and never commit them.
