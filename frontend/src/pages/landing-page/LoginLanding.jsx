import { useNavigate } from "react-router-dom";
import "./LoginLanding.css";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-screen landing">

      <div className="content">
        <h1 className="title">
          Welcome to, <span>Echo...</span>
        </h1>

        <p className="caption">Simple. Fast. Personal.</p>

        <button className="btn btn--primary" onClick={() => navigate("/login")}>
          Sign In
        </button>

        <button className="btn btn--secondary" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>


    </div>
  );
}

export default LoginPage;
