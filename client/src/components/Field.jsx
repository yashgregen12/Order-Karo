import React from "react";

export default function Field({
  label,
  children,
  className = "",
  required = false,
  error = "",
  hint = "",
}) {
  return (
    <label className={`flex flex-col text-sm gap-1.5 ${className}`}>
      {label && (
        <span className="flex items-center gap-1 text-gray-700 font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <div className="relative">
        {children}
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500">
            {error}
          </div>
        )}
      </div>
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
