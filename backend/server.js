const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('📦 Server starting...');

dotenv.config();
console.log('📋 Environment loaded');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI || 'using default');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
console.log('🛣️  Loading routes...');
try {
  console.log('   Loading auth...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('   ✅ auth loaded');
  
  console.log('   Loading resumes...');
  app.use('/api/resumes', require('./routes/resumes'));
  console.log('   ✅ resumes loaded');
  
  console.log('   Loading analysis...');
  app.use('/api/analysis', require('./routes/analysis'));
  console.log('   ✅ analysis loaded');
  
  console.log('   Loading profile...');
  app.use('/api/profile', require('./routes/profile'));
  console.log('   ✅ profile loaded');
  
  console.log('   Loading interview...');
  app.use('/api/interview', require('./routes/interview'));
  console.log('   ✅ interview loaded');
  
  console.log('   Loading savedResumes...');
  app.use('/api/saved-resumes', require('./routes/savedResumes'));
  console.log('   ✅ savedResumes loaded');
  
  console.log('   Loading jobs...');
  app.use('/api/jobs', require('./routes/jobs.routes'));
  console.log('   ✅ jobs loaded');
  
  console.log('✅ Routes loaded successfully');
} catch (routeError) {
  console.error('❌ Error loading routes:', routeError);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync';
console.log('🔌 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('   Full error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
