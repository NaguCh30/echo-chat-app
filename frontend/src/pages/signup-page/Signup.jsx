import "./Signup.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/axios";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !name || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        name,
        password,
      });

      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
    }
  };

  return (
    <div className="signup-screen">
      <header className="signup-header">
        <button
          className="signup-back-btn"
          onClick={() => navigate("/")}
        >
          ‹
        </button>
        <h1 className="signup-title">Sign Up</h1>
      </header>

      <form className="signup-form" onSubmit={handleSignup}>
        <label>Email *</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Name *</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Password *</label>
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="signup-alt">
          Already have an account?{" "}
          <span
            className="signup-link"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
        <button type="submit" className="btn btn--primary">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
