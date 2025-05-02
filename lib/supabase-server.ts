import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  const cookiesInstance = cookies();
  return createServerComponentClient({ cookies: () => cookiesInstance })
} 