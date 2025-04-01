"use client";
import { AuthLogo } from "../_components/_media/authLogo";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        return;
      }

     // On success, redirect to sign in
     router.push("/signin");
    } catch (err) {
      console.error("Sign-up error:", err);

      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Something went wrong");
      }
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className=" w-full flex flex-col items-center justify-center h-screen text-black font-morion">
      <div
        className="
          pl-56
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-cover
          bg-center
          opacity-25
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: `url('/503698ldsdl.jpg')`,
        }}
      />

      <div>

              <AuthLogo/>
            </div>
            <h1 className="my-10 text-5xl text-white font-custom1">Sign Up</h1>
      <div className="w-72 flex flex-col">
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="First Name"
            className="border px-2 py-1 text-white bg-zinc-800 border-zinc-800"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border px-2 py-1  text-white bg-zinc-800 border-zinc-800"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border px-2 py-1 text-white bg-zinc-800 border-zinc-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border px-2 py-1 text-white bg-zinc-800 border-zinc-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-secondary py-2 hover:bg-secondary-foreground transition-all"
          >
            Sign Up
          </button>
        </form>

        <button
        onClick={() => router.push("/signin")}
        className="mt-6 text-white px-4 py-2 hover:bg-white hover:text-black transition-all"
      >
        sign in instead
      </button>

        {errorMsg && (
          <p className="text-red-500 mt-2">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
    </Suspense>
  );
}
