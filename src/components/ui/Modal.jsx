import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { C } from "@/constants/tokens";

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 sm:pt-16 wp-anim-in"
      style={{ backgroundColor: "rgba(10,14,22,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl border bg-white shadow-xl wp-anim-up flex flex-col mb-12"
        style={{ borderColor: C.line, maxHeight: "calc(100vh - 6rem)", maxWidth: 720 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0"
          style={{ borderColor: C.line }}
        >
          <h3 className="wp-display text-lg font-semibold" style={{ color: C.text }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg wp-btn-ghost"
            style={{ color: C.muted }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto wp-scrollbar">{children}</div>

        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t shrink-0"
            style={{ borderColor: C.line }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
