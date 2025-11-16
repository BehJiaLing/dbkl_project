import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./login"; 
import Dashboard from "./dashboard";  
import Verification from "./verificationForm";  
import CameraPage from './camera';
import ErrorPage from "./error";  
import SignUpForm from './SignUpFrom';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verificationForm" element={<Verification />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
