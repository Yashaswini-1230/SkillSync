require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
<<<<<<< Updated upstream
=======
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load .env from backend folder so RAPIDAPI_KEY and other keys in backend/.env are found
dotenv.config({ path: path.join(__dirname, '.env') });
>>>>>>> Stashed changes

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"]
    }
});

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
});

// Initialize Sockets
require('./sockets/interviewHandler')(io);

app.use(cors());
app.use(express.json());
<<<<<<< Updated upstream
=======
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter); // Apply rate limiting to all API routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
>>>>>>> Stashed changes

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/saved-resumes', require('./routes/savedResumes'));
app.use('/api/jobs', require('./routes/jobs.routes'));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
});

const PORT = process.env.PORT || 5000;
<<<<<<< Updated upstream

app.listen(PORT, () => {
=======
server.listen(PORT, () => {
>>>>>>> Stashed changes
  console.log(`🚀 Server running on port ${PORT}`);
});
