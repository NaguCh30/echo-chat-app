import { useNavigate } from "react-router-dom";
import "./LoginLanding.css";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faExpand
} from "@fortawesome/free-solid-svg-icons";

function LoginPage() {
  const navigate = useNavigate();

  const handleInfoClick = () => {
    toast("Welcome! Please sign in to continue.");
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      toast.error("Fullscreen not supported");
    }
  };

  return (
    <div className="login-screen landing">
      <div className="top-bar">
        <button
          className="info-icon"
          aria-label="App information"
          onClick={handleInfoClick}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </button>
        <button
          className="fullscreen-icon"
          aria-label="Enter fullscreen"
          onClick={handleFullscreen}
        >
          <FontAwesomeIcon icon={faExpand} />
        </button>
      </div>

      <div className="content">
        <h1 className="title">Echo...</h1>
        <button
          className="btn btn--primary"
          onClick={() => navigate("/login")}
        >
          Sign In
        </button>

        <button
          className="btn btn--secondary"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
