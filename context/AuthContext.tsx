'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@/types/user'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchUserProfile = async (supabaseAuthUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for auth user:', supabaseAuthUser.id)
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('auth_id', supabaseAuthUser.id)
        .single()

      if (userError) {
        if (userError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', userError)
        } else {
          console.log('User profile not found (PGRST116), potentially new user.')
        }
        return null
      }
      console.log('User profile fetched:', userData)
      return userData
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    }
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    console.log('[Auth Context Effect] Running effect, setting up listener.')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      console.log('[Auth Context Listener] State changed:', { event, hasSession: !!session })

      const currentSupabaseUser = session?.user ?? null
      setAuthUser(currentSupabaseUser)

      if (currentSupabaseUser) {
        try {
          const profile = await fetchUserProfile(currentSupabaseUser)
          if (isMounted) {
            setUser(profile)
            console.log('[Auth Context Listener] Profile fetched, setting loading to false')
            setLoading(false)
          }
        } catch (error) {
          console.error('[Auth Context Listener] Error fetching profile:', error)
          if (isMounted) {
            setUser(null)
            setLoading(false)
          }
        }
      } else {
        if (isMounted) {
          setUser(null)
          console.log('[Auth Context Listener] No session, setting loading to false')
          setLoading(false)
        }
      }
    })

    return () => {
      console.log('[Auth Context Effect] Cleaning up listener')
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      console.log('Sign in response:', { data, error })
      
      if (error) {
        console.error('Sign in error details:', error)
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        throw error
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting to sign up...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName,
          },
        },
      })
      
      if (authError) {
        console.error("Supabase auth.signUp error:", authError)
        throw authError
      }

      if (!authData.user) {
        console.error('No user data returned from Supabase auth.signUp')
        throw new Error('Failed to create authentication user.')
      }

      console.log('User created in Supabase Auth, ID:', authData.user.id)
      console.log('User email:', authData.user.email)
      
      try {
        const { data: insertData, error: dbError } = await supabase
          .from('User')
          .insert({
            auth_id: authData.user.id,
            email: authData.user.email,
            firstName: firstName,
            lastName: lastName,
            role: 'USER'
          })
          .select()
          .single()

        if (dbError) {
          console.error('Error inserting user into public.User table:', dbError)
          if (dbError.code === '23505') {
            console.warn('User already exists in User table.')
          } else {
            throw dbError
          }
        }
        
        if (insertData) {
          console.log('User created successfully in public.User table:', insertData)
        }
      } catch (dbInsertError) {
        console.error('Caught error during database insert process:', dbInsertError)
        throw dbInsertError
      }
    } catch (error) {
      console.error('Overall sign up error:', error)
      throw new Error(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 