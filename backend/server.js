require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
