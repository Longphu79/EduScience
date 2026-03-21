import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function isLearnFlow(pathname = "") {
  return pathname.startsWith("/learn/");
}

export default function ScrollToTop() {
  const location = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const prev = prevLocationRef.current;
    const current = location;

    const pathnameChanged = prev.pathname !== current.pathname;
    const searchChanged = prev.search !== current.search;

    const onlyQueryChanged = !pathnameChanged && searchChanged;

    const keepScrollInLearnFlow =
      isLearnFlow(prev.pathname) && isLearnFlow(current.pathname);

    if (onlyQueryChanged || keepScrollInLearnFlow) {
      prevLocationRef.current = current;
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    scrollToTop();

    const raf1 = requestAnimationFrame(scrollToTop);
    const raf2 = requestAnimationFrame(scrollToTop);

    prevLocationRef.current = current;

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [location]);

  return null;
}