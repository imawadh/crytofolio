"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import config from "../config";

export default function LoginModal({ closemod }) {
  const router = useRouter();
  const [credentials, setcredentials] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closemod[0](false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closemod]);

  if (!closemod || !closemod[0]) return null;

  const onchange = (e) => {
    setcredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const BASE_URL = config.BASE_URL;

  const eventHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/register/Signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.text();

      if (data === "No such user found") {
        alert("No such user found");
      } else if (data === "incorrect password") {
        alert("Incorrect Password");
      } else {
        try {
          const parsed = JSON.parse(data);
          localStorage.setItem("authToken", parsed.authToken);
          closemod[0](false);
          router.push("/dashboard");
        } catch (parseError) {
          console.error("Error parsing login response:", parseError);
          alert("Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closemod[0](false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="glass-card w-full max-w-sm p-6 relative max-h-[85vh] overflow-y-auto animate-scale-in"
      >
        <button
          type="button"
          aria-label="Close sign in dialog"
          onClick={() => closemod[0](false)}
          className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <FiX className="w-5 h-5" aria-hidden="true" />
        </button>

        <h2 id="login-title" className="text-2xl font-bold text-center mb-1">
          Welcome back
        </h2>
        <p className="text-muted text-sm text-center mb-6">
          Sign in to access your portfolio
        </p>

        <form className="space-y-4" onSubmit={eventHandler}>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={onchange}
              className="input-field py-2.5 text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={onchange}
                className="input-field py-2.5 text-sm pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-md text-muted hover:text-foreground"
              >
                {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-base"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                closemod[1](true);
                closemod[0](false);
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
