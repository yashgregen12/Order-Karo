import React from "react";

export default function Select({ className = "", error, ...props }) {
  return (
    <div className="relative">
      <select
        className={`
          w-full border rounded-lg bg-white px-3 appearance-none transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }
          ${className}
        `}
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
