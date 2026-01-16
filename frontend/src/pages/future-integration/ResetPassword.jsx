import "./ResetPassword.css";
import { useActionData, useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  return (
    <div className="reset-screen">
      <h1 className="reset-title">Change Password</h1>

      <form className="reset-form">
        <label>New Password</label>
        <input type="Password" placeholder="Enter new password" />

        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm new password" />

        <button 
          type="submit" 
          className="btn primary"
          onClick={() => navigate("/login")}
          >
          Change Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;