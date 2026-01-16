import "./ChangePassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import toast from "react-hot-toast";

function ChangePasswordModal() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    navigate("/home");
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      const msg = "All fields are required";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.put("/user/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success("Password changed successfully");
      closeModal();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to change password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="cp-overlay" onClick={closeModal}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ CLOSE BUTTON */}
        <button className="cp-close" onClick={closeModal}>
          ✕
        </button>

        <h3>You are changing password</h3>

        <label>Enter old password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label>Enter new password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="cp-error">{error}</p>}

        <button
          className="cp-btn"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Changing..." : "Change"}
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
