import "./ForgotPassword.css"
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <div className="forgot-screen">
      <h1 className="forgot-title">Forgot Password?</h1>

      <form className="forgot-form">
        <label>Enter registered email</label>
        <input type="email" placeholder="Enter email" />

        <button 
          type="submit" 
          className="btn primary"
          onClick={() => navigate("/verify-otp")}
        >Send OTP</button>

        <p className="forgot-hint">Check email for OTP</p>
      </form>
    </div>
  );
}

export default ForgotPassword;