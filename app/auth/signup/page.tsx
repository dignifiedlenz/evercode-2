"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLogo } from "@/app/_components/_media/authLogo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signUpAction } from '@/app/actions/authActions'
import Image from 'next/image'

export default function SignUp() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsLoading(true)
    
    try {
      const result = await signUpAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/auth/signin')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

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
        <AuthLogo />
      </div>
      <h1 className="relative z-10 mb-4 text-5xl font-custom1">Sign Up</h1>
      <div className="relative z-10 flex flex-col space-y-4 pt-4 w-80">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
                disabled={isLoading}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
                disabled={isLoading}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
                disabled={isLoading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors w-full mb-4"
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="bg-secondary text-black font-medium rounded-md py-2.5 hover:bg-secondary-foreground transition-colors duration-300 w-full disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <button
              type="button"
              className="text-white hover:text-secondary transition-colors ml-1 p-0 h-auto font-normal bg-transparent underline"
              onClick={() => router.push('/auth/signin')}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}