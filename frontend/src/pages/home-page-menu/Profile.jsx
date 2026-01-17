import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/api/axios";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch current user
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data.user);
        setNewName(res.data.user.name);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchMe();
  }, []);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.put("/user/name", {
        name: newName,
      });

      setUser(res.data.user);
      setIsEditOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update name"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-screen">
      {/* HEADER */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h2 className="profile-title">Profile Settings</h2>
      </header>

      {/* AVATAR */}
      <div className="profile-avatar">
        {user.name.charAt(0).toUpperCase()}
      </div>

      {/* NAME SECTION */}
      <div className="profile-field">
        <label>Your name</label>
        <div className="profile-name-row">
          <input value={user.name} readOnly />
          <button
            className="edit-btn"
            onClick={() => setIsEditOpen(true)}
          >
            Edit
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Set new name</h3>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            {error && (
              <p style={{ color: "red", marginTop: "8px" }}>
                {error}
              </p>
            )}

            <button
              className="btn primary"
              onClick={handleUpdateName}
              disabled={loading}
            >
              {loading ? "Updating..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
