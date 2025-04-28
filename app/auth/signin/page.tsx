"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthLogo } from '@/app/_components/_media/authLogo'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/course');
        router.refresh();
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col space-y-4 pt-10 w-80">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
          <input
            type="text"
            placeholder="Email"
            className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            className="bg-secondary text-black font-medium rounded-md py-2.5 hover:bg-secondary-foreground transition-colors duration-300 w-full disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>

      {errorMsg && (
        <p className="relative z-10 text-red-500 mt-3 text-sm">{errorMsg}</p>
      )}

      <div className="relative z-10 mt-6 text-white/60 text-sm">
        Don't have an account?{' '}
        <button
          onClick={() => router.push("/auth/signup")}
          className="text-white hover:text-secondary transition-colors ml-1"
          disabled={isLoading}
        >
          Sign up
        </button>
      </div>
    </>
  );
}

export default function SignIn() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen text-white font-morion">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/503698ldsdl.jpg"
          alt="Background"
          fill
          priority
          className="object-cover brightness-[0.35]"
          quality={100}
        />
      </div>
      <div 
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.85)_100%)]"
      />
      <div className="relative z-10 mb-8">
        <AuthLogo/>
      </div>
      <h1 className="relative z-10 mb-4 text-5xl font-custom1">Sign In</h1>
      <Suspense fallback={<div className="relative z-10 text-white/60">Loading form...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}