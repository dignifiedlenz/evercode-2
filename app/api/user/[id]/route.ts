import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // In Next.js 15, params should be awaited
    const id = await params.id
    console.log('User API route accessed with ID:', id)
    
    try {
      // Create Supabase client
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (!user) {
        console.log('No user found with auth_id:', id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      console.log('Found user:', user)
      return NextResponse.json(user)
    } catch (error) {
      console.error('Error in user lookup:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in route handler:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
} 