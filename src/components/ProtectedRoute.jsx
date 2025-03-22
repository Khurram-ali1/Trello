import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");

  // If no token is found, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;