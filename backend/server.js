const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const http = require('http');

const { Server } = require('socket.io');

const app = express();

// =========================
// Middleware
// =========================

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// =========================
// Create HTTP Server
// =========================

const server =
  http.createServer(app);

// =========================
// Socket.IO Setup
// =========================

const io =
  new Server(server, {
    cors: {
      origin:
        FRONTEND_URL,
      methods:
        ['GET', 'POST']
    }
  });

// =========================
// Register Socket Handlers
// =========================

require('./socket/interviewHandler')(io);

// =========================
// Routes
// =========================

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/resumes',
  require('./routes/resumes')
);

app.use(
  '/api/analysis',
  require('./routes/analysis')
);

app.use(
  '/api/profile',
  require('./routes/profile')
);

app.use(
  '/api/interview',
  require('./routes/interview')
);

app.use(
  '/api/saved-resumes',
  require('./routes/savedResumes')
);

app.use(
  '/api/jobs',
  require('./routes/jobs.routes')
);
app.use(
  '/api/transcribe',
  require('./routes/transcribe')
);

// =========================
// MongoDB Connection
// =========================

const MONGODB_URI =
  process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    'MongoDB Connection Error: MONGODB_URI is missing. Check backend/.env.'
  );
  process.exit(1);
}

mongoose.connect(MONGODB_URI)

.then(() => {

  console.log(
    '✅ MongoDB Connected'
  );

})

.catch((err) => {

  console.error(
    '❌ MongoDB Connection Error:',
    err.message
  );

});

// =========================
// Start Server
// =========================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});
