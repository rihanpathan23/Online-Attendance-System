import { useEffect, useRef } from "react";

export default function Modal({ titleId, onClose, children, role = "dialog", maxWidth = 520 }) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const el = ref.current;
    const focusables = () =>
      el.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]"
      );
    (focusables()[0] || el).focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth,
          background: "#fff",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 25px 60px rgba(15,23,42,.3)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}