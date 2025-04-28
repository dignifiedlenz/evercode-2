'use server'

import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

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

    // Check if user already exists in our database to prevent duplicates if function runs again
    const existingUser = await prisma.user.findUnique({
        where: { auth_id: authData.user.id }
    });

    if (existingUser) {
        console.log('User already exists in database after Supabase signup:', existingUser);
        // Decide if you want to return an error or just proceed
        // For now, let's proceed assuming this might happen due to retries/edge cases
    } else {
        // 2. Create the user in our Prisma database
        await prisma.user.create({
          data: {
            auth_id: authData.user.id,
            email,
            firstName,
            lastName,
            role: 'USER' // Default role
          }
        });
        console.log('Created new user in database:', email);
    }

    // Successfully signed up and created DB entry
    return { success: true };

  } catch (error: any) {
    console.error('Error in signUpAction:', error);
    // Return a generic error message or specific one based on error type
    return { error: error.message || 'Sign-up failed. Please try again.' };
  }
} 