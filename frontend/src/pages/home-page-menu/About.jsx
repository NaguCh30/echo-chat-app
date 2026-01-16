import "./About.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    id: "about",
    title: "About Echo",
    content:
      "Echo is a real-time chat application under development,\nfocused on building a solid foundation for messaging,\nuser management, and scalable architecture."
  },
  {
    id: "features",
    title: "Core Features",
    content:
      "Core Features:\n• Real-time one-to-one messaging\n• Add contacts using email address\n• Message delivery and read status ( Indication with dots -> gray, yellow, green )\n• Contact blocking and chat management\n• Clean and minimal chat interface"
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    content:
      "Important Notice:\nEcho is currently in an early development stage.\nSome recovery features (such as password reset) are still under development.\nFor now, we recommend keeping your email and password safe.\nIf you face any account access issues, please contact us at: artist3391@gmail.com"
  },
  {
    id: "design",
    title: "Design Philosophy",
    content:
      "Echo follows a mobile-first, minimal, and distraction-free design approach."
  },
  {
    id: "future",
    title: "Future Enhancements",
    content:
      "• Media sharing\n• Voice messages\n• Online status\n• End-to-end encryption\n• Forgot Password option"
  },
  {
    id: "tech",
    title: "Technology Stack",
    content:
      "Frontend: React\nBackend: Node.js, Express\nDatabase: MongoDB\nRealtime: Socket.IO"
  },
  {
    id: "dev",
    title: "Vision & Development",
    content:
      "Echo is a MERN stack chat application created as a hands-on full-stack learning project.\nIt focuses on real-time messaging, authentication, and practical application architecture.\nDeveloped by Nagu Chavala."
  }
];

function About() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  const toggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="about-screen">
      {/* HEADER (FIXED) */}
      <header className="about-header">
        <button className="about-back" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h2>About Us</h2>
      </header>

      <div className="about-content">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className={`about-item ${
              activeId === sec.id ? "active" : ""
            }`}
          >
            <button
              className="about-title"
              onClick={() => toggle(sec.id)}
            >
              <span>{sec.title}</span>
              <span className="arrow">
                {activeId === sec.id ? ">" : "v"}
              </span>
            </button>

            {activeId === sec.id && (
              <div className="about-body">
                {sec.content.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
