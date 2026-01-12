import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Button from "../components/Button";
import Card from "../components/Card";
import Field from "../components/Field";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(password);
    if (result.success) {
      addToast("Login successful", "success");
    } else {
      addToast(result.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-indigo-100/50">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Protected Area</h2>
          <p className="text-gray-500 mt-2">
            Please enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-center text-xl tracking-[0.5em] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              placeholder="••••••"
              autoFocus
              required
            />
          </Field>

          <Button
            type="submit"
            loading={loading}
            className="w-full h-12 text-lg shadow-indigo-100"
          >
            Access Dashboard
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Inventory Management System
          </p>
        </div>
      </Card>
    </div>
  );
}
