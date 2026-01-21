# SkillSync Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Get your connection string
4. Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsync?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 3. Configure Frontend

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (for development)
- Verify your connection string is correct
- Check that your database user has read/write permissions

### Port Already in Use
- Change the PORT in `backend/.env` if 5000 is taken
- Change React's port: `PORT=3001 npm start` in frontend

### File Upload Issues
- Ensure `backend/uploads/resumes` directory exists
- Check file permissions
- Verify file size is under 10MB

### Missing Dependencies
- Delete `node_modules` folders and `package-lock.json` files
- Run `npm install` again in each directory

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET`
3. Configure CORS properly for your domain
4. Set up proper file storage (AWS S3, Cloudinary, etc.)
5. Build frontend: `cd frontend && npm run build`
6. Serve frontend build with a web server or integrate with backend

## Features Checklist

- ✅ User Authentication (Signup/Login)
- ✅ Resume Upload (PDF/DOCX)
- ✅ Resume Analysis with ATS Score
- ✅ PDF Report Generation
- ✅ Resume Builder
- ✅ AI Interview Prep
- ✅ Profile Management
- ✅ Dashboard with Analytics

## Next Steps

1. Set up MongoDB Atlas
2. Configure environment variables
3. Install dependencies
4. Start the application
5. Create an account and upload your first resume!
