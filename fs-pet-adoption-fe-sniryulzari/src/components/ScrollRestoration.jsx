import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Keyed by location.key so each history entry has its own saved Y position.
// Module-level (outside React) so it survives re-renders and route transitions.
const savedPositions = {};

export default function ScrollRestoration() {
  const location = useLocation();

  // Continuously track the scroll position for the current history entry
  useEffect(() => {
    const save = () => {
      savedPositions[location.key] = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [location.key]);

  // On every navigation: restore the saved position or jump to the top
  useEffect(() => {
    const saved = savedPositions[location.key];
    if (saved !== undefined) {
      // rAF lets the new page paint before we scroll, avoiding a flicker
      requestAnimationFrame(() => window.scrollTo(0, saved));
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.key]);

  return null;
}
