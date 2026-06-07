# SkillSync Setup Guide

## 1. Install Dependencies

From the project root:

```bash
npm run install-all
```

This installs:
- Root Node dependencies
- Backend Node dependencies
- Frontend Node dependencies
- AI service Python dependencies

If Python dependency installation fails, run it manually:

```bash
cd ai-service
pip install -r requirements.txt
```

## 2. Configure Backend

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
RAPIDAPI_KEY=
```

## 3. Configure Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 4. Configure AI Service

Create `ai-service/.env` if you want optional LLM feedback:

```env
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

The resume score and skill matching can still work without these keys.

## 5. Start The Application

From the root directory:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`
- AI service on `http://127.0.0.1:8000`

## Run Services Separately

```bash
npm run server
npm run client
npm run ai
```

## Troubleshooting

### MongoDB Connection Issues
- Check your MongoDB Atlas connection string.
- Make sure your IP whitelist allows your current IP.
- Verify that the database user has read/write permissions.

### AI Service Not Available
- Make sure `npm run ai` is running.
- Check that `AI_SERVICE_URL=http://127.0.0.1:8000` is in `backend/.env`.
- Install AI dependencies with `cd ai-service && pip install -r requirements.txt`.

### Frontend Cannot Reach Backend
- Make sure `VITE_API_URL=http://localhost:5000/api` is in `frontend/.env`.
- Make sure `FRONTEND_URL=http://localhost:5173` is in `backend/.env`.

### Port Already In Use
- Change `PORT` in `backend/.env` if `5000` is taken.
- Change the Vite port in the frontend command if `5173` is taken.
- Change the AI service port only if you also update `AI_SERVICE_URL`.
