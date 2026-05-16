import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import AuthLayout from "./pages/auth/laytout.tsx";
import SignIn from "./pages/auth/sign-in.tsx";
import SignUp from "./pages/auth/sign-up.tsx";
import { Toaster } from "sonner";
import ForgotPassword from "./pages/auth/forgot-password.tsx";
import ConfirmEmail from "./pages/auth/confirm-email.tsx";
import ResetPassword from "./pages/auth/reset-password.tsx";
import ProtectedRoute from "./pages/auth/Protected.tsx";
import { seedDefaultTemplates } from "./lib/seed.ts";
import Dashboard from "./pages/dashboard.tsx";
import ProfilePage from "./pages/profile.tsx";
import NotFound from "./pages/not-found.tsx";
import TemplatesPage from "./pages/templates.tsx";
import TeamSettings from "./pages/TeamSettings.tsx";
import AcceptInvite from "./pages/AcceptInvite.tsx";
import { Index } from "./pages/landing.tsx";

const root = document.getElementById("root")!;
root.classList.add("dark");

seedDefaultTemplates();

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/invite/:token" element={<AcceptInvite />} />

        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirmation" element={<ConfirmEmail />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams/:slug/settings" element={<TeamSettings />} />
          <Route path="/editor" element={<App />} />
          <Route path="/editor/:id" element={<App />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
