import { useEffect } from "react";

function ViewportListener() {
  useEffect(() => {
    const setAppHeight = () => {
      const height =
        window.visualViewport?.height || window.innerHeight;

      document.documentElement.style.setProperty(
        "--app-height",
        `${height}px`
      );
    };

    setAppHeight();

    window.visualViewport?.addEventListener("resize", setAppHeight);
    window.addEventListener("resize", setAppHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", setAppHeight);
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  return null;
}

export default ViewportListener;
