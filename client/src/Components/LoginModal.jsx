
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

export default function LoginModal({ closemod }) {
  const navigate = useNavigate();
  const [credentials, setcredentials] = useState({ email: "", password: "" });

  if (!closemod || !closemod[0]) return null;

  const onchange = (e) => {
    setcredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const BASE_URL = config.BASE_URL;

  const eventHandler = async (e) => {
    e.preventDefault();
    try {
        const body = {
          email: credentials.email,
          password: credentials.password,
        };
        const response = await fetch(`${BASE_URL}/register/Signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.text();
        
        if (data === "No such user found") {
          alert("No such user found");
        } 
        else if (data === "incorrect password") {
             alert("Incorrect Password");
        }
        else {
          // Success
          closemod[0](false); // Close Login
          
          try {
             const leyy = JSON.parse(data);

             localStorage.setItem("authToken", leyy.authToken);

             // Optionally trigger a refresh or state update here if needed
             // For now we just close the modal.
          } catch (parseError) {
              console.error("Error parsing login response:", parseError);
          }
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
      <div className="glass-card w-full max-w-sm p-6 relative max-h-[80vh] overflow-y-auto">
        
        {/* Close Button - Index 0 is Login */}
        <button
          onClick={() => closemod[0](false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
            Welcome Back
        </h2>

        <form className="space-y-4">
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={onchange}
                    className="input-field py-2 text-sm"
                    placeholder="john@example.com"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300">Password</label>
                <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={onchange}
                    className="input-field py-2 text-sm"
                    placeholder="••••••••"
                />
            </div>
            
            <div className="pt-2">
                <button
                    type="button" 
                    onClick={eventHandler}
                    className="btn-primary w-full py-2.5 text-base"
                >
                    Sign In
                </button>
            </div>

            <div className="text-center text-xs text-gray-400">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={() => {
                        closemod[1](true); // Open Signup
                        closemod[0](false); // Close Login
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    Sign Up
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
