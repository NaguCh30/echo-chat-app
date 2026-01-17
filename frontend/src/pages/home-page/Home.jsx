import "./Home.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "@/api/axios";
import { getSocket } from "@/socket";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const loggedInUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : null;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/chat");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      setChats((prev) => {
        const chatIndex = prev.findIndex(
          (c) => c._id === message.chatId
        );
        if (chatIndex === -1) return prev;

        const updatedChat = {
          ...prev[chatIndex],
          lastMessage: message,
          updatedAt: new Date().toISOString(),
        };

        const newChats = [...prev];
        newChats.splice(chatIndex, 1);
        return [updatedChat, ...newChats];
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleChatCreated = async () => {
      try {
        const res = await api.get("/chat");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to refresh chats", err);
      }
    };

    socket.on("chatCreated", handleChatCreated);
    return () => socket.off("chatCreated", handleChatCreated);
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/user/me");
        setUserName(res.data.user.name);
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) =>
        prev.filter((chat) => chat._id !== chatId)
      );
    };

    socket.on("chatDeleted", handleChatDeleted);

    return () => {
      socket.off("chatDeleted", handleChatDeleted);
    };
  }, []);


  const handleSendInvitation = async () => {
    if (!email.trim() || !contactName.trim()) {
      setError("Email and name are required");
      return;
    }

    try {
      setSending(true);
      setError("");

      const res = await api.post("/request/send", {
        email,
        name: contactName,
      });

      if (res.data.alreadyContact) {
        toast(res.data.message);
        setIsAddContactOpen(false);
        setEmail("");
        setContactName("");
        navigate(`/chat/${res.data.chatId}`);
        return;
      }

      setEmail("");
      setContactName("");
      setIsAddContactOpen(false);
      toast.success("Contact request sent successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send request"
      );
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const name = chat.displayName?.toLowerCase() || "";
    const otherUser = chat.participants.find(
      (u) => u._id !== loggedInUserId
    );
    const email = otherUser?.email?.toLowerCase() || "";

    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="home-screen">
      <header className="home-header">
        <h2 className="home-greeting">
          Hello, <span>{userName || ""}</span>
        </h2>
        <button
          className="home-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
      </header>

      <div className="home-search">
        <input
          type="text"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="chat-list">
        {chats.length === 0 && (
          <p className="home-empty">No chats yet</p>
        )}

        {filteredChats.map((chat) => {
          const otherUser = chat.participants.find(
            (u) => u._id !== loggedInUserId
          );

          return (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat._id}`)}
            >
              <div className="chat-avatar">
                {otherUser?.name?.charAt(0) || "U"}
              </div>

              <div className="chat-info">
                <div className="chat-name">
                  {chat.displayName || "Unknown"}
                </div>
                <div className="chat-message">
                  {chat.lastMessage?.text || "No messages yet"}
                </div>
              </div>

              <div className="chat-meta">
                <div className="chat-time">
                  {chat.updatedAt
                    ? new Date(chat.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="home-fab"
        onClick={() => setIsAddContactOpen(true)}
      >
        +
      </button>

      {isSidebarOpen && (
        <div
          className="home-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside
            className="home-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="home-sidebar-menu">
              <li onClick={() => navigate("/profile")}>Profile</li>
              <li onClick={() => navigate("/requests")}>Requests</li>
              <li onClick={() => navigate("/about")}>About</li>
              <li onClick={() => navigate("/change-password")}>
                Change Password
              </li>
            </ul>

            <button
              className="home-logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </aside>
        </div>
      )}

      {isAddContactOpen && (
        <div
          className="home-modal-overlay"
          onClick={() => setIsAddContactOpen(false)}
        >
          <div
            className="home-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="home-modal-close"
              onClick={() => setIsAddContactOpen(false)}
            >
              ✕
            </button>

            <h3>Add Contact</h3>

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your friend email"
            />

            <label>Set a name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name after your friend request accept"
            />

            {error && <p className="home-error">{error}</p>}

            <button
              className="btn btn--primary"
              onClick={handleSendInvitation}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
