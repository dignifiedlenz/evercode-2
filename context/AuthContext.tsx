'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@/types/user'
import { useRouter } from 'next/navigation'

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
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session check result:', { session, error: sessionError })
        
        if (session?.user) {
          console.log('User session found, fetching user data...')
          // Fetch user directly from Supabase
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          if (userError) {
            console.error('Error fetching user data:', userError)
            throw userError
          }

          if (!userData) {
            console.error('No user data found for auth_id:', session.user.id)
            throw new Error('User not found in database')
          }

          console.log('User data fetched:', userData)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, session })
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('User signed in, fetching user data...')
          // Fetch user directly from Supabase
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          if (userError) {
            console.error('Error fetching user data:', userError)
            throw userError
          }

          if (!userData) {
            console.error('No user data found for auth_id:', session.user.id)
            throw new Error('User not found in database')
          }

          console.log('User data fetched:', userData)
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
        console.error("Supabase auth.signUp error:", authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from Supabase auth.signUp');
        throw new Error('Failed to create authentication user.');
      }

      console.log('User created in Supabase Auth, ID:', authData.user.id);
      console.log('User email:', authData.user.email);
      
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
          .single();

        if (dbError) {
          console.error('Error inserting user into public.User table:', dbError);
          throw dbError;
        }

        console.log('User created successfully in public.User table:', insertData);
      } catch (dbInsertError) {
        console.error('Caught error during database insert process:', dbInsertError);
        throw dbInsertError;
      }
    } catch (error) {
      console.error('Overall sign up error:', error);
      throw new Error(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
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