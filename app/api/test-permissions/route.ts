import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
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

    // 1. Check if User table exists and has proper permissions
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('check_table_permissions', { table_name: 'User' })

    if (tableError) {
      console.error('Error checking table permissions:', tableError)
      return NextResponse.json({
        status: 'error',
        error: 'Failed to check table permissions',
        details: tableError
      }, { status: 500 })
    }

    // 2. Enable RLS if not already enabled
    if (!tableInfo?.rls_enabled) {
      const { error: rlsError } = await supabaseAdmin
        .rpc('enable_rls', { table_name: 'User' })

      if (rlsError) {
        console.error('Error enabling RLS:', rlsError)
        return NextResponse.json({
          status: 'error',
          error: 'Failed to enable RLS',
          details: rlsError
        }, { status: 500 })
      }
    }

    // 3. Create or update RLS policies
    const { error: policyError } = await supabaseAdmin
      .rpc('setup_user_policies')

    if (policyError) {
      console.error('Error setting up policies:', policyError)
      return NextResponse.json({
        status: 'error',
        error: 'Failed to setup policies',
        details: policyError
      }, { status: 500 })
    }

    // 4. Test the connection with a simple query
    const { data: testData, error: testError } = await supabaseAdmin
      .from('User')
      .select('count')
      .limit(1)

    return NextResponse.json({
      status: 'success',
      tableInfo,
      testQuery: {
        success: !testError,
        data: testData,
        error: testError
      }
    })

  } catch (error) {
    console.error('Permission test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 