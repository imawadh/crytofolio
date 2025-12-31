import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "../../config";

export default function UpdateInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.id;
  const BASE_URL = config.BASE_URL;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch initial user data
  useEffect(() => {
    if (!userid) return;
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dashboard/userdetails`, {
            method: "POST",
            body: JSON.stringify({ UserId: userid }),
            headers: { "Content-type": "application/json" },
        });
        const json = await response.json();
        if (json.Data) {
            setFirstName(json.Data.first_name || "");
            setLastName(json.Data.last_name || "");
        }
      } catch (err) {
          console.error("Error fetching user details:", err);
      } finally {
          setInitialLoading(false);
      }
    };
    fetchUserData();
  }, [userid]);

  const handleUpdate = async () => {
    setLoading(true);
    let profileUrl = null;

    try {
        // 1. Upload Image if selected
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "crypto_profile");
            data.append("cloud_name", "dcth4owgy");

            const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dcth4owgy/image/upload", {
                method: "post",
                body: data,
            });
            const cloudinaryData = await cloudinaryRes.json();
            
            if (cloudinaryData.url) {
                profileUrl = cloudinaryData.url;
            } else {
                throw new Error("Image upload failed");
            }
        }

        // 2. Update Backend
        const payload = { 
            UserId: userid, 
            first_name: firstName, 
            last_name: lastName 
        };
        if (profileUrl) {
            payload.ProfileUrl = profileUrl;
        }

        const response = await fetch(`${BASE_URL}/dashboard/profileupdate`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-type": "application/json" },
        });
        
        const json = await response.json();
        
        if (json.success) {
            navigate("/dashboard", { state: { id: userid } });
        } else {
            alert("Update failed: " + (json.message || "Unknown error"));
        }

    } catch (err) {
        console.error("Error updating profile:", err);
        alert("Error updating profile: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  if (initialLoading) {
      return (
          <div className="flex h-screen items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
      );
  }

  return (
    <div className="pt-32 min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-lg p-10">
        
        <h2 className="text-3xl font-bold mb-8 text-center">Edit Profile</h2>
        
        <div className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">First Name</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input-field"
                        placeholder="First Name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input-field"
                        placeholder="Last Name"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Profile Picture</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-blue-500 transition-colors cursor-pointer relative bg-[#1f2937]/30 text-center">
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                    />
                    
                    {image ? (
                        <div className="text-green-400 font-semibold">
                            {image.name}
                            <div className="text-xs text-gray-500 mt-2">Click to change</div>
                        </div>
                    ) : (
                    <div className="text-gray-400">
                        <p className="text-base mb-1">Drag & Drop or Click to Upload</p>
                        <p className="text-xs">Supports JPG, PNG</p>
                    </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleUpdate}
                disabled={loading}
                className={`btn-primary w-full py-3 text-lg mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Saving...
                    </span>
                ) : (
                    "Save Changes"
                )}
            </button>
            
            <button 
                onClick={() => navigate(-1)}
                className="w-full text-center text-gray-500 hover:text-white text-sm"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
