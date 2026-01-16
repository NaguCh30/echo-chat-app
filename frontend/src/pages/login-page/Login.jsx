import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/api/axios";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      toast.success("Login successful");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-screen">
      <header className="auth-header">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
          aria-label="Back to landing"
        >
          ‹
        </button>
        <h1 className="login-title">Login</h1>
      </header>

      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <label>Email *</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password *</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* SIGNUP LINK */}
        <p className="auth-switch">
          Don’t have an account?{" "}
          <span
            className="auth-link"
            onClick={() => navigate("/signup")}
          >
            Go to Sign up
          </span>
        </p>

        <button
          type="button"
          className="btn btn--primary"
          onClick={handleLogin}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
