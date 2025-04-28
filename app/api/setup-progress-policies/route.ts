import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Enable RLS on VideoProgress table
    const { error: rlsError } = await supabaseAdmin
      .rpc('enable_rls', { table_name: 'VideoProgress' })

    if (rlsError) {
      console.error('Error enabling RLS on VideoProgress:', rlsError)
      return NextResponse.json({
        status: 'error',
        error: 'Failed to enable RLS on VideoProgress',
        details: rlsError
      }, { status: 500 })
    }

    // Create RLS policies for VideoProgress
    const { error: policyError } = await supabaseAdmin
      .rpc('setup_video_progress_policies')

    if (policyError) {
      console.error('Error setting up VideoProgress policies:', policyError)
      return NextResponse.json({
        status: 'error',
        error: 'Failed to setup VideoProgress policies',
        details: policyError
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Successfully set up RLS policies for VideoProgress table'
    })
  } catch (error) {
    console.error('Error in setup-progress-policies:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
} 