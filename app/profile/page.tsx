"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Keep local state for first/last name
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // For password reset
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // For error/success messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // If user is not authenticated, redirect or show loading
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Pre-fill fields with existing user data if you fetch them
  // Or you can fetch from an API route. For example:
  useEffect(() => {
    async function fetchUserData() {
      // We'll just assume 'session.user.email' is available
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/user/profile");
          if (!res.ok) throw new Error("Failed to load user profile");
          const data = await res.json();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        } catch (err: unknown) {
            if (err instanceof Error) {
              console.error(err.message);
              setErrorMsg(err.message);
            } else {
              console.error("Unexpected error:", err);
              setErrorMsg("An unexpected error occurred.");
            }
          }
      }
    }
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // If newPassword is provided, user wants to change password
    // oldPassword is mandatory in that case (or whatever your policy is)
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setSuccessMsg("Profile updated successfully!");
      // Optionally clear the password fields
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
          setErrorMsg(err.message);
        } else {
          console.error("Unexpected error:", err);
          setErrorMsg("An unexpected error occurred.");
        }
      }
      
  }

  const handleBackToDashboard = () => {
    // Takes user to the dashboard
    router.push("/");
    // or just "/"
  };


  if (status === "loading") {
    return <p className="text-white">Loading session...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h1 className="text-2xl mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-64">
        <input
          type="text"
          placeholder="First Name"
          className="border px-3 py-2"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="border px-3 py-2"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {/* For password reset */}
        <input
          type="password"
          placeholder="Old Password"
          className="border px-3 py-2"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="border px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 hover:bg-blue-700"
        >
          Update Profile
        </button>
        <button
        onClick={handleBackToDashboard}
        className="mt-6 px-4 py-2 bg-gray-600 rounded text-white"
      >
        Back to Dashboard
      </button>
      </form>
       
      {errorMsg && <p className="mt-2 text-red-800">{errorMsg}</p>}
      {successMsg && <p className="mt-2 text-secondary">{successMsg}</p>}
    </div>
  );
}
