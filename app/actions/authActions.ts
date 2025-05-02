'use server'

import { supabase } from '@/app/lib/supabase'
import { randomUUID } from 'crypto'

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: 'Missing required fields' };
  }

  try {
    // 1. Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Supabase user not created');

    const now = new Date().toISOString();

    // 2. Create the user in our Supabase database
    const { error: dbError } = await supabase
      .from('User')
      .insert({
        id: randomUUID(),
        auth_id: authData.user.id,
        email,
        firstName,
        lastName,
        role: 'USER',
        createdAt: now,
        updatedAt: now
      });

    if (dbError) throw dbError;

    // Successfully signed up and created DB entry
    return { success: true };

  } catch (error) {
    console.error('Error in signUpAction:', error);
    return { error: error instanceof Error ? error.message : 'Sign-up failed. Please try again.' };
  }
} 