"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react"; 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js'; // Import User type

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null); // Use Supabase User type
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Keep local state for first/last name
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // For password reset
  const [oldPassword, setOldPassword] = useState(""); // Keep old password field for now, though updateUser might not need it directly
  const [newPassword, setNewPassword] = useState("");
  // For error/success messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (!session) {
          router.push("/signin");
          return;
        }
        
        setUser(session.user); // Set the user state
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setErrorMsg("Failed to load session. Please try logging in again.");
        setLoading(false);
        // Optional: redirect after a delay or provide a login button
        // router.push("/signin"); 
      }
    };

    checkUser();
  // Removed router dependency as it's not directly needed for session check logic, supabase client is stable
  }, []); 

  // Pre-fill fields with existing user data from the user state
  useEffect(() => {
    if (user) {
      // Get data from user_metadata
      setFirstName(user.user_metadata?.firstName || "");
      setLastName(user.user_metadata?.lastName || "");
    }
  // Depend on the user object
  }, [user]); 

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!user) {
      setErrorMsg("User not found. Please login again.");
      return;
    }

    // Construct the data object for Supabase update
    const updateData: { password?: string; data?: { [key: string]: any } } = {
      data: { 
        firstName: firstName,
        lastName: lastName,
       },
    };

    // Only include password if it's being changed
    if (newPassword) {
      // Basic validation - ensure new password is not empty
      if (newPassword.length < 6) { // Example: Enforce minimum length
          setErrorMsg("New password must be at least 6 characters long.");
          return;
      }
      updateData.password = newPassword;
    }
    
    setLoading(true); // Indicate loading state during update

    try {
      // Call Supabase auth update function
      const { data, error } = await supabase.auth.updateUser(updateData);

      if (error) {
        // Handle specific errors if needed, e.g., weak password
        console.error("Supabase updateUser error:", error);
        throw new Error(error.message || "Failed to update profile.");
      }
      
      // Update was successful
      setSuccessMsg("Profile updated successfully!");
      
      // Optionally update local user state if metadata changed and doesn't auto-refresh
      if (data.user) {
          setUser(data.user); // Update user state with potentially new metadata
      }

      // Clear password fields after successful update
      setOldPassword(""); 
      setNewPassword("");

    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
          setErrorMsg(err.message);
        } else {
          console.error("Unexpected error:", err);
          setErrorMsg("An unexpected error occurred during update.");
        }
      } finally {
          setLoading(false); // End loading state
      }
  }

  const handleBackToDashboard = () => {
    router.push("/");
  };

  if (loading && !user) { // Show loading only if user data is not yet available
    return <p className="text-white">Loading...</p>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
<div
        className="
          pl-56
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-cover
          bg-center
          opacity-35
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: `url('/532328ldsdl.jpg')`,
        }}
      />
      <h1 className="text-2xl mb-4 text-white font-custom1">Update your Credentials</h1>
      {/* Add loading indicator to the form perhaps? */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-64">
        {/* Email (read-only) */}
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 bg-gray-200 text-gray-700" // Style as read-only
          value={user?.email || ""}
          readOnly 
        />
        <input
          type="text"
          placeholder="First Name"
          className="border px-3 py-2"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading} // Disable during update
        />
        <input
          type="text"
          placeholder="Last Name"
          className="border px-3 py-2"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading} // Disable during update
        />
        {/* Removed Old Password field as supabase.auth.updateUser doesn't require it for password change when authenticated */}
        {/* <input
          type="password"
          placeholder="Old Password"
          className="border px-3 py-2"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          disabled={loading} 
        /> */}
        <input
          type="password"
          placeholder="New Password (leave blank to keep)"
          className="border px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading} // Disable during update
        />
        <button
          type="submit"
          className={`bg-secondary text-black py-2 hover:bg-secondary-foreground transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading} // Disable button during update
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        <button
        type="button" // Prevent form submission
        onClick={handleBackToDashboard}
        className="mt-6 px-4 py-2 rounded text-white hover:bg-white hover:text-black hover:pr-10 transition-all"
        disabled={loading} // Disable during update
      >
        ← Back to Dashboard
      </button>
      </form>
      {errorMsg && <p className="mt-2 text-red-500 bg-white/80 p-2 rounded">{errorMsg}</p>}
      {successMsg && <p className="mt-2 text-green-700 bg-white/80 p-2 rounded">{successMsg}</p>}
    </div>
    </Suspense>
  );
}
