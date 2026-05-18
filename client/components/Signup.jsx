"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import config from "../config";

export default function Signup({ closemod }) {
  const router = useRouter();

  const [credentials, setcredentials] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    age: "",
    mob: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const BASE_URL = config.BASE_URL;

  const onchange = (e) => {
    setcredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const eventHandler = async (e) => {
    e.preventDefault();
    if (
      !credentials.first_name ||
      !credentials.last_name ||
      !credentials.email ||
      !credentials.password
    ) {
      alert("Please fill in all required fields");
      return;
    }
    if (credentials.password.length < 5) {
      alert("Password must be at least 5 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/register/creatuser`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          age: credentials.age,
          mob: credentials.mob,
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        alert(`Server error: ${response.status} ${response.statusText}`);
        return;
      }

      const json = await response.json();

      if (json.userexist) {
        alert("User already exists. Please login instead.");
      } else if (!json.success) {
        alert("Signup failed. Please check your credentials.");
      } else {
        localStorage.setItem("authToken", json.authToken);
        setSignedUp(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (signedUp) {
      closemod[1](false);
      router.push("/dashboard");
    }
  }, [signedUp, closemod, router]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closemod[1](false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closemod]);

  if (!closemod || !closemod[0]) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closemod[1](false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
        className="glass-card w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <button
          type="button"
          aria-label="Close sign up dialog"
          onClick={() => closemod[1](false)}
          className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <FiX className="w-5 h-5" aria-hidden="true" />
        </button>

        <h2 id="signup-title" className="text-2xl font-bold text-center mb-1">
          Create account
        </h2>
        <p className="text-muted text-sm text-center mb-6">
          Start managing your crypto portfolio
        </p>

        <form className="grid grid-cols-1 gap-4" onSubmit={eventHandler}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="su-first" className="text-sm font-medium text-foreground">
                First name <span className="text-danger">*</span>
              </label>
              <input
                id="su-first"
                type="text"
                name="first_name"
                autoComplete="given-name"
                required
                value={credentials.first_name}
                onChange={onchange}
                className="input-field py-2.5 text-sm"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="su-last" className="text-sm font-medium text-foreground">
                Last name <span className="text-danger">*</span>
              </label>
              <input
                id="su-last"
                type="text"
                name="last_name"
                autoComplete="family-name"
                required
                value={credentials.last_name}
                onChange={onchange}
                className="input-field py-2.5 text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="su-age" className="text-sm font-medium text-foreground">
                Age
              </label>
              <input
                id="su-age"
                type="number"
                name="age"
                inputMode="numeric"
                value={credentials.age}
                onChange={onchange}
                className="input-field py-2.5 text-sm"
                placeholder="25"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="su-mob" className="text-sm font-medium text-foreground">
                Mobile
              </label>
              <input
                id="su-mob"
                type="tel"
                name="mob"
                inputMode="tel"
                autoComplete="tel"
                value={credentials.mob}
                onChange={onchange}
                className="input-field py-2.5 text-sm"
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="su-email" className="text-sm font-medium text-foreground">
              Email address <span className="text-danger">*</span>
            </label>
            <input
              id="su-email"
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
            <label htmlFor="su-pw" className="text-sm font-medium text-foreground">
              Password <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="su-pw"
                type={showPw ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={5}
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
            <p className="text-xs text-muted">Minimum 5 characters.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-base"
          >
            {submitting ? "Creating account…" : "Sign Up"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                closemod[0](true);
                closemod[1](false);
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
