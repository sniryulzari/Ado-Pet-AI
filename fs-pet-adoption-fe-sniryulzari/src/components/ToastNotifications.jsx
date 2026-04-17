import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { _register } from "../utils/toast";

const ICONS = {
  success: <FaCheckCircle />,
  error:   <FaTimesCircle />,
  info:    <FaInfoCircle />,
};

export default function ToastNotifications() {
  const [list, setList] = useState([]);

  useEffect(() => {
    _register(setList);
    return () => _register(null);
  }, []);

  function dismiss(id) {
    setList((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="toast-host" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {list.map((n) => (
          <motion.div
            key={n.id}
            className={`toast-item toast-item--${n.type}`}
            initial={{ y: -64, opacity: 0, scale: 0.95 }}
            animate={{ y: 0,   opacity: 1, scale: 1 }}
            exit={   { y: -64, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <span className={`toast-icon toast-icon--${n.type}`}>{ICONS[n.type]}</span>
            <span className="toast-msg">{n.text}</span>
            <button
              className="toast-close"
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss notification"
            >
              <FaTimes size="0.75em" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
