import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Only redirect recruiters away from LandingPage/public routes.
  if (user && user.role === 'recruiter') {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
