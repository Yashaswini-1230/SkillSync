# SkillSync - Resume Analysis Platform

A comprehensive MERN stack application for resume analysis, ATS optimization, and job matching.

## 🚀 Features

- **User Authentication** - Secure signup/login with JWT
- **Resume Upload** - Upload and manage PDF/DOCX resumes
- **Resume Analysis** - Advanced analysis using TF-IDF and cosine similarity
- **ATS Score** - Get your resume's ATS compatibility score
- **Resume Builder** - Build professional resumes with live preview
- **AI Interview Prep** - Generate role-specific interview questions
- **Profile Management** - Update your account information

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas (Mongoose)
- JWT Authentication
- Multer for file uploads
- PDF parsing and generation
- Natural Language Processing (TF-IDF, cosine similarity)

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls
- React Hot Toast for notifications

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillsync
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

   Create `frontend/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

## 📁 Project Structure

```
skillsync/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions (PDF parser, analysis engine)
│   ├── uploads/         # Uploaded files
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   └── App.js       # Main app component
│   └── public/
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get specific resume
- `DELETE /api/resumes/:id` - Delete resume

### Analysis
- `POST /api/analysis` - Analyze resume
- `GET /api/analysis` - Get all analyses
- `GET /api/analysis/:id` - Get specific analysis
- `GET /api/analysis/:id/download` - Download PDF report

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Interview
- `POST /api/interview/generate` - Generate interview questions

## 🎨 UI Features

- Fixed top navbar
- Hamburger sidebar menu
- Responsive design
- Professional color scheme
- Smooth animations and transitions
- Loading states
- Error handling
- Toast notifications

## 📝 Usage

1. **Sign Up** - Create a new account
2. **Upload Resume** - Upload your resume (PDF or DOCX)
3. **Analyze** - Select resume, enter job role and description
4. **View Results** - Get ATS score, matching/missing skills, and suggestions
5. **Download Report** - Download detailed PDF analysis report
6. **Build Resume** - Use the resume builder to create professional resumes
7. **Interview Prep** - Generate interview questions based on your resume

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- File type and size validation

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
