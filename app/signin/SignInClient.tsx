"use client";

import { AuthLogo } from "../_components/_media/authLogo";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/course";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // We'll manually redirect
      callbackUrl,
    });

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      router.push(callbackUrl);
    }
  }

  return (

    
    <div className=" w-full flex flex-col items-center justify-center h-screen text-black font-morion">
      <div
        className="
          w-[120vw]
          h-[120vh]
          absolute
          inset-0
          bg-cover
          bg-center
          pointer-events-none
          transition-all
          duration-100
          -z-10
        "
        style={{
          backgroundImage: `url('/516038ldsdl.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-black/50 -z-10"></div>
      <div>
        <AuthLogo/>
      </div>
      <h1 className="my-4 text-5xl text-white font-custom1">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 pt-10 w-64">
        <input
          type="text"
          placeholder="Email"
          className="border rounded px-2 py-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-2 py-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-secondary rounded py-2 hover:bg-secondary-foreground"
        >
          Sign In
        </button>
      </form>

      {errorMsg && (
        <p className="text-red-500 mt-3">{errorMsg}</p>
      )}

      {/* Sign Up Button */}
      <button
        onClick={() => router.push("/signup")}
        className="mt-6 text-white px-4 py-2 rounded hover:bg-white hover:text-black hover:px-7 transition-all"
      >
        sign up instead  →
      </button>
    </div>
  );
}
