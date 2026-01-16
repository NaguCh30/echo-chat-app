import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { getSocket } from "../../socket";

function Chat() {
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [activeChatModal, setActiveChatModal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [chatDetails, setChatDetails] = useState(null);
  const [loadingHeader, setLoadingHeader] = useState(true);

  const [nicknameInput, setNicknameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const token = localStorage.getItem("token");
  const loggedInUserId = token
    ? JSON.parse(atob(token.split(".")[1])).userId
    : null;

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/messages`);
        setMessages(res.data);
        await api.put(`/chat/${chatId}/delivered`);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const fetchChatDetails = async () => {
      try {
        const res = await api.get(`/chat/${chatId}/details`);
        setChatDetails(res.data);
      } catch (err) {
        console.error("Failed to load chat details", err);
      } finally {
        setLoadingHeader(false);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  useEffect(() => {
    if (!messages.length) return;

    const hasUnreadIncoming = messages.some(
      (m) =>
        m.senderId._id !== loggedInUserId &&
        m.status !== "seen"
    );

    if (hasUnreadIncoming) {
      api.put(`/chat/${chatId}/seen`);
    }
  }, [messages, chatId, loggedInUserId]);

  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();
    socket.emit("joinChat", chatId);

    const handleNewMessage = (message) => {
      setMessages((prev) =>
        prev.some((m) => m._id === message._id)
          ? prev
          : [...prev, message]
      );
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("messageDelivered", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.status === "sent" ? { ...m, status: "delivered" } : m
        )
      );
    });

    socket.on("messageSeen", () => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, status: "seen" }))
      );
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDelivered");
      socket.off("messageSeen");
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;
    await api.post(`/chat/${chatId}/message`, { text });
    setText("");
  };


  //modal functions
  //Edit name
  const handleEditName = async () => {
    if (!chatDetails || !nicknameInput.trim()) return;

    try {
      setSavingName(true);

      const res = await api.patch(
        `/contacts/${chatDetails.contactId}/nickname`,
        { nickname: nicknameInput.trim() }
      );

      // header update
      setChatDetails((prev) => ({
        ...prev,
        nickname: res.data.nickname,
      }));

      setActiveChatModal(null);
    } catch (err) {
      console.error("Failed to update nickname", err);
    } finally {
      setSavingName(false);
    }
  };

  //Clear chat
  const handleClearChat = async () => {
    if (!chatDetails) return;

    try {
      await api.patch(
        `/contacts/${chatDetails.contactId}/clear`
      );

      // Clear messages locally
      setMessages([]);

      setActiveChatModal(null);
    } catch (err) {
      console.error("Failed to clear chat", err);
    }
  };

  //Block contact
  const handleToggleBlock = async () => {
    if (!chatDetails) return;

    try {
      const res = await api.patch(
        `/contacts/${chatDetails.contactId}/block`
      );

      setChatDetails((prev) => ({
        ...prev,
        isBlocked: res.data.isBlocked,
      }));

      setActiveChatModal(null);
    } catch (err) {
      console.error("Failed to toggle block", err);
    }
  };

  //Delete contact
  const handleDeleteContact = async () => {
    if (!chatDetails) return;

    try {
      await api.delete(
        `/contacts/${chatDetails.contactId}`
      );

      navigate("/home");
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };


  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          ‹
        </button>

        <div className="chat-header-info">
          {/*<div className="chat-avatar">
            {chatDetails?.contactUser?.name?.charAt(0) || "U"}
          </div>*/}
          <div>
            <div className="chat-name">
              {loadingHeader
              ? "Loading..."
              : chatDetails?.nickname ||
              chatDetails?.contactUser?.name||
              "Unknown"}
            </div>
          </div>
        </div>

        <button
          className="chat-menu-btn"
          onClick={() => setIsChatMenuOpen(true)}
        >
          ⋯
        </button>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = msg.senderId._id === loggedInUserId;

          return (
            <div
              key={msg._id}
              className={`message ${isMine ? "outgoing" : "incoming"}`}
            >
              <div className="bubble">
                {msg.text}
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMine && (
                    <span
                      className={`status-dot ${
                        msg.status === "sent"
                          ? "gray"
                          : msg.status === "delivered"
                          ? "yellow"
                          : "green"
                      }`}
                    ></span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <button className="attach-btn">📎</button>
        <input
          type="text"
          placeholder={
            chatDetails?.isBlocked
            ? "You blocked this contact"
            : "Type message..."
          }
          value={text}
          disabled={chatDetails?.isBlocked}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => 
            e.key === "Enter" &&
            !chatDetails?.isBlocked&& 
            handleSendMessage()
          }
        />
        <button 
          className="send-btn" 
          disabled={chatDetails?.isBlocked}
          onClick={handleSendMessage}
        >
          ➤
        </button>
      </div>

      {isChatMenuOpen && (
        <div
          className="chat-menu-overlay"
          onClick={() => setIsChatMenuOpen(false)}
        >
          <div
            className="chat-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="chat-menu-list">
              <li onClick={() => {
                setNicknameInput(chatDetails?.nickname || "");
                setActiveChatModal("editName");
              }}>
                Edit name
              </li>
              <li onClick={() => {
                setIsChatMenuOpen(false);
                setActiveChatModal("clearChat");
              }}>
                Clear chat
              </li>
              <li onClick={() => {
                setIsChatMenuOpen(false);
                setActiveChatModal("block");
              }}>
                {chatDetails?.isBlocked ? "Unblock" : "Block"}
              </li>
              <li onClick={() => {
                setIsChatMenuOpen(false);
                setActiveChatModal("delete");
              }}>
                Delete contact
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeChatModal === "editName" && (
        <div
          className="modal-overlay"
          onClick={() => setActiveChatModal(null)}
        >
          <div
            className="chat-action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Edit name</h3>
              <button
               className="modal-close"
               onClick={() => setActiveChatModal(null)}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter a nick name"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              className="modal-input"
            />
            <button
              className="btn btn--primary btn--full"
              disabled={savingName || !nicknameInput.trim()}
              onClick={handleEditName}
            >
              {savingName ? "Saving..." : "Edit"}
            </button>
          </div>
        </div>
      )}

      {activeChatModal === "clearChat" && (
        <div
          className="modal-overlay"
          onClick={() => setActiveChatModal(null)}
        >
          <div
            className="chat-action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Clear chat</h3>
              <button
                className="modal-close"
                onClick={() => setActiveChatModal(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ marginBottom: "15px" }}>
              All messages in this chat will be cleared.
            </p>

            <button
              className="btn btn--danger-light btn--full"
              onClick={handleClearChat}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {activeChatModal === "block" && (
        <div
          className="modal-overlay"
          onClick={() => setActiveChatModal(null)}
        >
          <div
            className="chat-action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {chatDetails?.isBlocked ? "Unblock contact" : "Block contact"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setActiveChatModal(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ marginBottom: "15px" }}>
              {chatDetails?.isBlocked
                ? "You will be able to send and receive messages again."
                : "You will no longer send or receive messages from this contact."}
            </p>

            <button
              className={`btn ${
                chatDetails?.isBlocked ? "btn--primary" : "btn--danger"
              } full`}
              onClick={handleToggleBlock}
            >
              {chatDetails?.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        </div>
      )}

      {activeChatModal === "delete" && (
        <div
          className="modal-overlay"
          onClick={() => setActiveChatModal(null)}
        >
          <div
            className="chat-action-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Delete contact</h3>
              <button
                className="modal-close"
                onClick={() => setActiveChatModal(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ marginBottom: "15px" }}>
              This will remove this contact and clear the chat for you.
            </p>

            <button
              className="btn btn--danger-strong btn--full"
              onClick={handleDeleteContact}
            >
              Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Chat;
