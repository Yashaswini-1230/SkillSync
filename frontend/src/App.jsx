import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import AnalyzeResume from './pages/AnalyzeResume';
import ResumeBuilder from './pages/ResumeBuilder';
import SavedResumes from './pages/SavedResumes';
import InterviewPrep from './pages/InterviewPrep';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Navbar />
          <Sidebar />
          <Chatbot />
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadResume />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <PrivateRoute>
                  <AnalyzeResume />
                </PrivateRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <PrivateRoute>
                  <ResumeBuilder />
                </PrivateRoute>
              }
            />
            <Route
              path="/saved-resumes"
              element={
                <PrivateRoute>
                  <SavedResumes />
                </PrivateRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <PrivateRoute>
                  <InterviewPrep />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <Jobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
