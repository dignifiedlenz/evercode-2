'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getServerSupabaseClient() {
  return createServerComponentClient({ cookies })
} 