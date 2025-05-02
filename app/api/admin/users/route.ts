import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper to verify admin status
async function verifyAdmin(supabase: any) {
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Admin verification: No session found', sessionError)
      return { authorized: false, error: 'Unauthorized - Please log in' }
    }

    // Get user from Prisma DB to check role
    const user = await prisma.user.findUnique({
      where: { 
        // Use the auth.users UUID as foreign key
        auth_id: session.user.id 
      }
    })

    if (!user) {
      console.error('Admin verification: User not found in DB')
      return { authorized: false, error: 'Unauthorized - User not found' }
    }

    // Check if user has admin role - using the appropriate user roles from the enum
    if (user.role !== UserRole.ROOT_ADMIN && 
        user.role !== UserRole.SUPER_ADMIN && 
        user.role !== UserRole.REGIONAL_ADMIN && 
        user.role !== UserRole.LOCAL_ADMIN) {
      console.error('Admin verification: User does not have admin role')
      return { 
        authorized: false, 
        error: 'Forbidden - Admin privileges required' 
      }
    }

    return { authorized: true, userId: user.id }
  } catch (error) {
    console.error('Error in admin verification:', error)
    return { 
      authorized: false, 
      error: 'Server error during authorization'
    }
  }
}

export async function GET() {
  try {
    console.log('Admin Users API: GET request received')
    
    // Pass cookies correctly - using recommended pattern
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Get all users with their groups
    const users = await prisma.user.findMany({
      include: {
        group: {
          select: {
            id: true,
            name: true,
            regionId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('Admin Users API: Fetched users:', users.length)
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Users API: POST request received')
    
    // Use the same pattern as the GET handler
    const cookiesInstance = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookiesInstance })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { email, password, firstName, lastName } = body
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })
    
    if (authError) {
      console.error('Error creating user in Supabase Auth:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        auth_id: authData.user.id,
        email,
        firstName,
        lastName,
        role: UserRole.USER
      }
    })
    
    console.log('Admin Users API: Created user:', user)
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 