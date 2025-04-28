import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Test auth connection with regular client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('Auth test result:', { authData, authError })

    // Test database connection with direct REST API call
    try {
      // Try to get schema information using REST API
      const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      })

      const schemaData = await schemaResponse.json()
      console.log('Schema test result:', schemaData)

      // Try to query users table using REST API
      const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      })

      const usersData = await usersResponse.json()
      console.log('Users test result:', usersData)

      return NextResponse.json({
        status: 'success',
        auth: {
          connected: !authError,
          error: authError?.message
        },
        database: {
          connected: schemaResponse.ok && usersResponse.ok,
          schemaStatus: schemaResponse.status,
          usersStatus: usersResponse.status,
          schema: schemaData,
          users: usersData
        },
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
        }
      })
    } catch (dbError) {
      console.error('Database test error:', dbError)
      return NextResponse.json({
        status: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        details: {
          message: dbError instanceof Error ? dbError.message : 'No details available',
          stack: dbError instanceof Error ? dbError.stack : undefined
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        message: error instanceof Error ? error.message : 'No details available',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
} 