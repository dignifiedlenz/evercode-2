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
      console.log('No session found in admin groups API')
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
      user.role !== UserRole.SUPER_ADMIN && 
      user.role !== UserRole.REGIONAL_ADMIN && 
      user.role !== UserRole.LOCAL_ADMIN
    ) {
      return { authorized: false, error: 'Insufficient permissions' }
    }
    
    return { authorized: true, session, user }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, error: 'Authentication error' }
  }
}

export async function GET() {
  try {
    console.log('Admin Groups API: GET request received')
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error, user } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Get all groups with their regions and dioceses
    const groups = await prisma.group.findMany({
      include: {
        region: {
          select: {
            id: true,
            name: true,
            dioceseId: true,
            diocese: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
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
    
    console.log('Admin Groups API: Fetched groups:', groups.length)
    
    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Groups API: POST request received')
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { name, regionId, address } = body
    
    if (!name || !regionId) {
      return NextResponse.json({ error: 'Group name and region ID are required' }, { status: 400 })
    }
    
    // Check if region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId }
    })
    
    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }
    
    // Create group with required fields
    const group = await prisma.group.create({
      data: {
        name,
        address: address || '', // Use empty string as default if address not provided
        region: {
          connect: {
            id: regionId
          }
        }
      }
    })
    
    console.log('Admin Groups API: Created group:', group)
    
    return NextResponse.json(group)
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 