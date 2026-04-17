// Lightweight custom toast utility — drop-in replacement for react-toastify.
// Call sites only need to change the import path; the API surface is identical.

let _setter = null;
let _nextId = 0;

export function _register(setter) {
  _setter = setter;
}

function push(type, message) {
  if (!_setter) return;
  const id = ++_nextId;
  const text = typeof message === "string" ? message : String(message);
  _setter((prev) => [...prev, { id, type, text }]);
  setTimeout(() => {
    _setter((prev) => prev.filter((n) => n.id !== id));
  }, 3300);
}

// POSITION is a stub so call sites that pass `{ position: toast.POSITION.X }` don't throw.
export const toast = {
  success: (msg) => push("success", msg),
  error:   (msg) => push("error",   msg),
  info:    (msg) => push("info",    msg),
  POSITION: { TOP_RIGHT: null, BOTTOM_RIGHT: null, TOP_CENTER: null, TOP_LEFT: null },
};
