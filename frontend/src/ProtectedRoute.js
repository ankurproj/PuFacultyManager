import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if(!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds
    console.log(decoded.exp, currentTime);
    
    if (decoded.exp < currentTime) {
      // Token has expired
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // Invalid token
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  return children
}

export default ProtectedRoute;