# SkillSync - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm run install-all
```

Or manually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 2: Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (free tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string

### Step 3: Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=change_this_to_a_random_secret_key
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Start the Application

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### Step 5: Open Your Browser

Navigate to: **http://localhost:3000**

## ✅ What You Can Do

1. **Sign Up** - Create your account
2. **Upload Resume** - Upload PDF or DOCX files
3. **Analyze Resume** - Get ATS score and insights
4. **Download Report** - Get detailed PDF analysis
5. **Build Resume** - Create professional resumes
6. **Interview Prep** - Generate interview questions

## 🐛 Common Issues

### MongoDB Connection Failed
- Check your connection string
- Make sure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
- Verify database user has read/write permissions

### Port Already in Use
- Change PORT in `backend/.env`
- Or kill the process using the port

### Module Not Found
- Delete `node_modules` and reinstall
- Make sure you're in the correct directory

## 📚 Next Steps

- Read `SETUP.md` for detailed setup
- Read `README.md` for full documentation
- Check the code comments for implementation details

## 🎉 You're Ready!

Start building your resume analysis workflow!
