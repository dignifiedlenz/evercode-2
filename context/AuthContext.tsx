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

  // Create the Supabase client with correct options
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

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

    // Make initial auth check more explicit and direct
    const performInitialAuthCheck = async () => {
      if (!isMounted) return;
      
      try {
        // Get session directly first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth Context] Session error:', sessionError);
          if (isMounted) {
            setAuthUser(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (!sessionData.session) {
          console.log('[Auth Context] No active session found');
          if (isMounted) {
            setAuthUser(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        // We have a session, set the auth user
        const currentUser = sessionData.session.user;
        if (isMounted) {
          setAuthUser(currentUser);
        }
        
        // Try to fetch the profile
        if (currentUser) {
          try {
            const profile = await fetchUserProfile(currentUser);
            if (isMounted) {
              setUser(profile);
              setLoading(false);
            }
          } catch (profileError) {
            console.error('[Auth Context] Profile fetch error:', profileError);
            if (isMounted) {
              // Still set the auth user even if profile fetch fails
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('[Auth Context] Initial auth check error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Run the initial check
    performInitialAuthCheck();

    console.log('[Auth Context Effect] Setting up onAuthStateChange listener.');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Context Listener] Fired! Event:', event, 'Has Session:', !!session);
      if (!isMounted) {
        console.log('[Auth Context Listener] Unmounted, skipping update.');
        return;
      }
      
      const currentSupabaseUser = session?.user ?? null;
      
      // Only update if auth state actually changed
      if (
        (currentSupabaseUser && !authUser) || // User signed in
        (!currentSupabaseUser && authUser) || // User signed out
        (currentSupabaseUser && authUser && currentSupabaseUser.id !== authUser.id) // Different user
      ) {
        console.log('[Auth Context Listener] Auth state changed, updating...');
        
        setAuthUser(currentSupabaseUser);

        if (currentSupabaseUser) {
          console.log('[Auth Context Listener] User found via listener, attempting to fetch profile...');
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
              // Don't clear the user here, just mark loading as false
              console.log('[Auth Context Listener] Error case via listener, setting loading=false.');
              setLoading(false);
            }
          }
        } else {
          console.log('[Auth Context Listener] No session/user found via listener. Setting user=null, loading=false.');
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } else {
        console.log('[Auth Context Listener] Auth state unchanged, skipping profile fetch.');
        // Still ensure loading is false
        if (isMounted && loading) {
          setLoading(false);
        }
      }
    });

    // Remove the initial check IIFE - rely solely on the listener now
    // (async () => { ... })();

    // Add a more robust timeout mechanism to ensure we exit loading state
    // even if auth callbacks don't fire as expected
    const initialLoadTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.log('[Auth Context Effect] Timeout: Still loading after delay. Setting loading=false.');
        
        // After timeout, directly check session state again to be sure
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (isMounted) {
            const finalUser = session?.user ?? null;
            if (finalUser && !authUser) {
              // We have a session but no authUser set - fix the state
              setAuthUser(finalUser);
              // Try one more time to fetch profile
              fetchUserProfile(finalUser).then(profile => {
                if (isMounted) {
                  setUser(profile);
                  setLoading(false);
                }
              }).catch(() => {
                if (isMounted) {
                  setLoading(false);
                }
              });
            } else {
              // No session or already processed, ensure loading is false
              setLoading(false);
            }
          }
        }).catch(error => {
          console.error('[Auth Context Effect] Final session check error:', error);
          if (isMounted) {
            setLoading(false);
          }
        });
      }
    }, 2000); // Increased from 1.5s to 2s to give auth more time


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
      
      // Clear the user state before signing out to avoid race conditions
      setUser(null);
      setAuthUser(null);
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      // Use a timeout before redirect to give the signOut time to complete
      setTimeout(() => {
        console.log('Sign out successful, redirecting after delay...')
        router.push('/auth/signin')
      }, 300);
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