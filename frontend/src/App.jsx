import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import { RunAuditPage } from "./pages/Audit/AuditPage";
import { ResultsPage } from "./pages/Results/ResultsPage";
import { PricingPage } from "./pages/Pricing/PricingPage";
import { ContactPage } from "./pages/Contact/Contact";
import { PrivacyPage } from "./pages/Privacy/PrivacyPage";
import { TermsPage } from "./pages/Terms/TermsPage";
import { FeaturesPage } from "./pages/Features/Features";
import { SignupPage } from "./pages/Auth/Signup/Signup";
import { LoginPage } from "./pages/Auth/Login/Login";
import { Dashboard } from "./pages/DashboardPages/Dashboard/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";

const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<RunAuditPage />} />
      <Route path="/result" element={<ResultsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />}/>
      <Route path="/reset-password/:token" element={<ResetPassword />}/>

      {/* Auth Pages (redirect if logged in) */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      <Route
        path="/signin"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
