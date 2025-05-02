import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to verify admin privileges
async function verifyAdmin(supabase: any) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      console.log('No session found in admin dioceses API')
      return { authorized: false, error: 'Unauthorized' }
    }
    
    // Look up user to check role
    const user = await prisma.user.findUnique({
      where: { auth_id: session.user.id },
      select: { role: true }
    })
    
    if (!user) {
      return { authorized: false, error: 'User not found' }
    }
    
    // Check if user is an admin
    if (
      user.role !== UserRole.ROOT_ADMIN && 
      user.role !== UserRole.SUPER_ADMIN
    ) {
      return { authorized: false, error: 'Insufficient permissions: Only ROOT_ADMIN and SUPER_ADMIN can manage dioceses' }
    }
    
    return { authorized: true, session, user }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, error: 'Authentication error' }
  }
}

export async function GET(request: Request) {
  try {
    console.log('Admin Dioceses API: GET request received')
    
    const cookiesInstance = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookiesInstance })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Get all dioceses with their regions
    const dioceses = await prisma.diocese.findMany({
      include: {
        regions: {
          select: {
            id: true,
            name: true
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log('Admin Dioceses API: Fetched dioceses:', dioceses.length)
    
    return NextResponse.json(dioceses)
  } catch (error) {
    console.error('Error fetching dioceses:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Dioceses API: POST request received')
    
    const cookiesInstance = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookiesInstance })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Diocese name is required' }, { status: 400 })
    }
    
    // Create diocese
    const diocese = await prisma.diocese.create({
      data: {
        name
      }
    })
    
    console.log('Admin Dioceses API: Created diocese:', diocese)
    
    return NextResponse.json(diocese)
  } catch (error) {
    console.error('Error creating diocese:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 