import { Toaster } from "react-hot-toast";
import ViewportListener from "@/components/ViewportListener";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginLanding from "@/pages/landing-page/LoginLanding";
import Login from "@/pages/login-page/Login";
import Signup from "@/pages/signup-page/Signup";

import ForgotPassword from "@/pages/future-integration/ForgotPassword";
import VerifyOtp from "@/pages/future-integration/VerifyOtp";
import ResetPassword from "@/pages/future-integration/ResetPassword";

import Home from "@/pages/home-page/Home";
import Chat from "@/pages/chat-page/Chat";

import Profile from "@/pages/home-page-menu/Profile";
import Requests from "@/pages/home-page-menu/Requests";
import About from "@/pages/home-page-menu/About";
import ChangePassword from "@/pages/home-page-menu/ChangePassword";

import ProtectedRoute from "@/components/ProtectedRoute";

import useViewportHeight from "@/hooks/useViewportHeight";

function App() {
  useViewportHeight();
  return (
    <BrowserRouter>
      <ViewportListener />
      <Toaster
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFFFFF",
            color: "#1C1E21",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          },
          success: {
            style: {
              borderLeft: "4px solid #3F8CFF",
            },
          },
          error: {
            style: {
              borderLeft: "4px solid #E53935",
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
