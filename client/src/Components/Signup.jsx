import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";


export default function Signup({ closemod }) {
  const navigate = useNavigate();
  
  const [credentials, setcredentials] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mob: "",
  });

  const onchange = (e) => {
    setcredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  
  const [signedUp, setSignedUp] = useState(false);
  
  if (!closemod || !closemod[0]) return null;
  
const BASE_URL = config.BASE_URL;

  const eventHandler = async (e) => {
    e.preventDefault(); 
    try {
      // Validate fields
      if (!credentials.first_name || !credentials.last_name || !credentials.email || !credentials.password) {
        alert("Please fill in all required fields");
        return;
      }
      
      if (credentials.password.length < 5) {
        alert("Password must be at least 5 characters long");
        return;
      }


      const response = await fetch(`${BASE_URL}/register/creatuser`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
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
        console.error("Response not OK:", response.status, response.statusText);
        alert(`Server error: ${response.status} ${response.statusText}`);
        return;
      }

      const json = await response.json();


      if (json.userexist) {
        alert("User already exists. Please login instead.");
      } 
      else {
        if (!json.success) {
          alert("Signup failed. Please check your credentials.");
        } else {
          localStorage.setItem("authToken", json.authToken);
          console.log("Signup successful!");
          setSignedUp(true);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };



  if (signedUp) {
    closemod[1](false);
  } 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
      <div className="glass-card w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button - Index 1 is Signup */}
        <button
          onClick={() => closemod[1](false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
            Create Account
        </h2>

        <form className="grid grid-cols-1 gap-4">
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300">First Name</label>
                <input
                    type="text"
                    name="first_name"
                    value={credentials.first_name}
                    onChange={onchange}
                    className="input-field py-2 text-sm"
                    placeholder="John"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300">Last Name</label>
                <input
                    type="text"
                    name="last_name"
                    value={credentials.last_name}
                    onChange={onchange}
                    className="input-field py-2 text-sm"
                    placeholder="Doe"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={credentials.age}
                        onChange={onchange}
                        className="input-field py-2 text-sm"
                        placeholder="25"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300">Mobile</label>
                    <input
                        type="number"
                        name="mob"
                        value={credentials.mob}
                        onChange={onchange}
                        className="input-field py-2 text-sm"
                        placeholder="1234567890"
                    />
                </div>
            </div>

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
                    Sign Up
                </button>
            </div>

            <div className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={() => {
                        closemod[0](true); // Open Login
                        closemod[1](false); // Close Signup
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    Sign In
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
