import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import "./Requests.css"

function Requests() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("sent"); // sent | received
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          api.get("/request/received"),
          api.get("/request/sent"),
        ]);

        setReceived(receivedRes.data);
        setSent(sentRes.data);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await api.post(`/request/${id}/accept`);
      navigate(`/chat/${res.data.chat._id}`);
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/request/${id}/reject`);
      setReceived((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading requests...</p>;
  }

  return (
    <div className="requests-screen">
      <header className="requests-header">
        <h2>Requests</h2>
        <button
          className="requests-close"
          onClick={() => navigate("/home")}
        >
          ✕
        </button>
      </header>

      <div className="requests-tabs">
        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className={activeTab === "received" ? "active" : ""}
          onClick={() => setActiveTab("received")}
        >
          Received
        </button>
      </div>

      <div className="requests-list">
        {activeTab === "sent" && (
          <>
            {sent.length === 0 && (
              <p className="requests-empty">No sent requests</p>
            )}

            {sent.map((req) => (
              <div className="request-card" key={req._id}>
                <div className="request-user">
                  <strong>{req.receiver.name}</strong>
                  <span>{req.receiver.email}</span>
                </div>

                <div
                  className={`request-status ${
                    req.status === "accepted"
                      ? "accepted"
                      : "pending"
                  }`}
                >
                  {req.status}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "received" && (
          <>
            {received.length === 0 && (
              <p className="requests-empty">
                No received requests
              </p>
            )}

            {received.map((req) => (
              <div className="request-card" key={req._id}>
                <div className="request-user">
                  <strong>{req.sender.name}</strong>
                  <span>{req.sender.email}</span>
                </div>

                <div className="request-actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => handleAccept(req._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn--danger-light"
                    onClick={() => handleReject(req._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Requests;
