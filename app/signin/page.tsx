import React, { Suspense } from "react";
import SignInClient from "./SignInClient";

function SignInLoading() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center h-screen text-black font-morion overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <img
          src="/503698ldsdl.jpg"
          alt="Background"
          className="object-cover w-full h-full"
        />
      </div>
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%)'
        }}
      />
      <div className="relative z-10">
        <img src="/logo.png" alt="Logo" className="w-32 h-32" />
      </div>
      <h1 className="relative z-10 my-4 text-5xl text-white font-custom1">Sign In</h1>
      <div className="relative z-10 text-white">Loading...</div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInClient />
    </Suspense>
  );
}
