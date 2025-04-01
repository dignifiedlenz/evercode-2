"use client";

import { AuthLogo } from "../_components/_media/authLogo";
import React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/course";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col space-y-3 pt-10 w-64">
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
        <p className="relative z-10 text-red-500 mt-3">{errorMsg}</p>
      )}

      <button
        onClick={() => router.push("/signup")}
        className="relative z-10 mt-6 text-white px-4 py-2 rounded hover:bg-white hover:text-black hover:px-7 transition-all"
      >
        sign up instead  →
      </button>
    </>
  );
}

export default function SignInClient() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center h-screen text-black font-morion overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/503698ldsdl.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%)'
        }}
      />
      <div className="relative z-10">
        <AuthLogo/>
      </div>
      <h1 className="relative z-10 my-4 text-5xl text-white font-custom1">Sign In</h1>
      <Suspense fallback={<div className="relative z-10 text-white">Loading form...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
