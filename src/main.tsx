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

const root = document.getElementById("root")!;
root.classList.add("dark");

seedDefaultTemplates();

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster richColors position="bottom-right" />

      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor" element={<App />} />
          <Route path="/editor/:id" element={<App />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="confirmation" element={<ConfirmEmail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
