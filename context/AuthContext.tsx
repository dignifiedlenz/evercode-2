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

  // Log environment variables (ensure they are defined client-side)
  console.log('[Auth Context] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[Auth Context] Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING!');

  const supabase = createClientComponentClient()

  const fetchUserProfile = async (supabaseAuthUser: SupabaseUser) => {
    console.log('[fetchUserProfile] Attempting fetch for:', supabaseAuthUser.id);
    try {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('auth_id', supabaseAuthUser.id)
        .single()

      if (userError) {
        if (userError.code === 'PGRST116') {
          console.log('[fetchUserProfile] Profile not found (PGRST116), returning null.');
        } else {
          console.error('[fetchUserProfile] Error fetching profile:', userError);
        }
        return null; // Return null on error or not found
      }
      console.log('[fetchUserProfile] Profile fetched successfully:', userData);
      return userData;
    } catch (error) {
      console.error('[fetchUserProfile] Unexpected error during fetch:', error);
      return null; // Return null on unexpected errors
    }
  }

  useEffect(() => {
    let isMounted = true;
    console.log('[Auth Context Effect] Initializing.');
    setLoading(true); // Reset loading state on mount

    console.log('[Auth Context Effect] Setting up onAuthStateChange listener.');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Context Listener] Fired! Event:', event, 'Has Session:', !!session);
      if (!isMounted) {
        console.log('[Auth Context Listener] Unmounted, skipping update.');
        return;
      }
      
      const currentSupabaseUser = session?.user ?? null;
      setAuthUser(currentSupabaseUser);

      if (currentSupabaseUser) {
        console.log('[Auth Context Listener] User found via listener, attempting to fetch profile...');
        // Fetch profile ONLY IF the user is different from the current one,
        // or if the user state is currently null (initial load or after sign out)
        // This check might be overly complex, let's simplify for now and just fetch
        // if (currentSupabaseUser.id !== user?.auth_id || !user) {
          try {
            const profile = await fetchUserProfile(currentSupabaseUser);
            if (isMounted) {
              setUser(profile);
              console.log('[Auth Context Listener] Profile fetch complete via listener. Setting loading=false.');
              setLoading(false);
            }
          } catch (error) {
            console.error('[Auth Context Listener] Error calling fetchUserProfile:', error);
            if (isMounted) {
              setUser(null);
              console.log('[Auth Context Listener] Error case via listener, setting loading=false.');
              setLoading(false);
            }
          }
        // } else {
        //   console.log('[Auth Context Listener] Listener fired, but user unchanged. Ensuring loading is false.');
        //   if (isMounted && loading) setLoading(false); // Ensure loading is false if user is already set
        // }
      } else {
        console.log('[Auth Context Listener] No session/user found via listener. Setting user=null, loading=false.');
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Remove the initial check IIFE - rely solely on the listener now
    // (async () => { ... })();

    // Initial check is implicitly handled by the listener potentially firing with INITIAL_SESSION or SIGNED_IN
    // We might need to set loading=false if the listener doesn't fire quickly on initial load *without* a session
    // Let's add a small delay to handle the "no session on initial load" case
    const initialLoadTimer = setTimeout(() => {
      if (isMounted && loading && !authUser) {
        console.log('[Auth Context Effect] Timeout: Still loading and no authUser after delay. Setting loading=false.');
        setLoading(false);
        setUser(null); // Ensure user is null
      }
    }, 1500); // Wait 1.5 seconds for listener or initial session


    return () => {
      console.log('[Auth Context Effect] Cleaning up listener.');
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(initialLoadTimer); // Clear the timeout
    };
  }, [supabase]);

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