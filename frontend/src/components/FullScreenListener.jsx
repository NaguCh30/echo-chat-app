import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FullscreenListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        navigate("/");
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [navigate]);

  return null;
}

export default FullscreenListener;
