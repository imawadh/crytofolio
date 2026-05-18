"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import config from "../../config";

export default function UpdateInfo() {
  const router = useRouter();
  const BASE_URL = config.BASE_URL;
  const login =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [userid, setUserid] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!login) {
      router.replace("/");
      return;
    }
    fetch(`${BASE_URL}/dashboard/dashboard`, {
      method: "POST",
      body: JSON.stringify({ Token: login }),
      headers: { "Content-type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.id) setUserid(j.id);
        else {
          localStorage.removeItem("authToken");
          router.replace("/");
        }
      })
      .catch((err) => console.error("Error resolving user id:", err));
  }, [login, BASE_URL, router]);

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
  }, [userid, BASE_URL]);

  const handleUpdate = async () => {
    setLoading(true);
    let profileUrl = null;
    try {
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "crypto_profile");
        formData.append("cloud_name", "dcth4owgy");
        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dcth4owgy/image/upload",
          { method: "post", body: formData }
        );
        const cloudinaryData = await cloudinaryRes.json();
        if (cloudinaryData.url) profileUrl = cloudinaryData.url;
        else throw new Error("Image upload failed");
      }

      const payload = {
        UserId: userid,
        first_name: firstName,
        last_name: lastName,
      };
      if (profileUrl) payload.ProfileUrl = profileUrl;

      const response = await fetch(`${BASE_URL}/dashboard/profileupdate`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-type": "application/json" },
      });
      const json = await response.json();
      if (json.success) router.push("/dashboard");
      else alert("Update failed: " + (json.message || "Unknown error"));
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-dvh flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-lg p-8 sm:p-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          Edit Profile
        </h1>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="up-first"
                className="text-sm font-medium text-foreground"
              >
                First Name
              </label>
              <input
                id="up-first"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="up-last"
                className="text-sm font-medium text-foreground"
              >
                Last Name
              </label>
              <input
                id="up-last"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="up-file"
              className="text-sm font-medium text-foreground"
            >
              Profile Picture
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary transition-colors relative bg-surface-2/40 text-center">
              <input
                id="up-file"
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
              />
              {image ? (
                <div className="text-success font-semibold">
                  {image.name}
                  <div className="text-xs text-muted mt-2">Click to change</div>
                </div>
              ) : (
                <div className="text-muted">
                  <p className="text-base mb-1">Click to upload</p>
                  <p className="text-xs">Supports JPG, PNG</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-center text-muted hover:text-foreground text-sm transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
