import "./VerifyOtp.css" 
import { useNavigate } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();

  return (
    <div className="otp-screen">
      <h1 className="otp-title">Enter OTP</h1>

      <form className="otp-form">
        <div className="otp-inputs">
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
        </div>

        <button 
          type="submit" 
          className="btn primary"
          onClick={() => navigate("/reset-password")}
        >
          Confirm OTP</button>
      </form>
    </div>
  );
}

export default VerifyOtp;