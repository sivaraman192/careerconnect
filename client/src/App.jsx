import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplyJobPage from './pages/ApplyJobPage';
import SavedJobsPage from './pages/SavedJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProfilePage from './pages/ProfilePage';
import CandidatePipeline from './pages/CandidatePipeline';
import CandidateDetail from './pages/CandidateDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-darkBg text-slate-100 selection:bg-brandPurple/30">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />

              {/* Seeker Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply/:jobId"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <ApplyJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter & Admin Routes */}
              <Route
                path="/recruiter-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate-pipeline"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <CandidatePipeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate-pipeline/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <CandidateDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Common Protected Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker', 'recruiter', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
