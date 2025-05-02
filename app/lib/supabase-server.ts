'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For Server Components
export async function getServerSupabaseClient() {
  const cookiesInstance = cookies();
  return createServerComponentClient({ cookies: () => cookiesInstance })
}

// For Server Actions
export async function getServerActionClient() {
  const cookiesInstance = cookies();
  return createServerActionClient({ cookies: () => cookiesInstance })
}

// For Route Handlers
export async function getRouteHandlerClient() {
  const cookiesInstance = cookies();
  return createRouteHandlerClient({ cookies: () => cookiesInstance })
} 