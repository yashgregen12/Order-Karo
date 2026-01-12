import React, { useEffect } from "react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 mb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-gray-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === "danger" && (
              <div className="p-3 bg-red-50 rounded-full text-red-600 shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            className="sm:min-w-[100px]"
          >
            {confirmText}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
