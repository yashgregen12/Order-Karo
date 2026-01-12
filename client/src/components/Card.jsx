import React from "react";
// Glassmorphism inspired card with modern shadows

export default function Card({
  children,
  className = "",
  title = "",
  subtitle = "",
  footer = null,
  loading = false,
}) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100/80 bg-white/50">
          {title && (
            <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="p-6 relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600"></div>
          </div>
        ) : null}
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100/80 backdrop-blur-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
