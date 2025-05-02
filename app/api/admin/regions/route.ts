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
      console.log('No session found in admin regions API')
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
    console.log('Admin Regions API: GET request received')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Get all regions with their diocese
    const regions = await prisma.region.findMany({
      include: {
        diocese: {
          select: {
            id: true,
            name: true
          }
        },
        groups: {
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
    
    console.log('Admin Regions API: Fetched regions:', regions.length)
    
    return NextResponse.json(regions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Regions API: POST request received')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { name, dioceseId } = body
    
    if (!name || !dioceseId) {
      return NextResponse.json({ error: 'Region name and diocese ID are required' }, { status: 400 })
    }
    
    // Check if diocese exists
    const diocese = await prisma.diocese.findUnique({
      where: { id: dioceseId }
    })
    
    if (!diocese) {
      return NextResponse.json({ error: 'Diocese not found' }, { status: 404 })
    }
    
    // Create region
    const region = await prisma.region.create({
      data: {
        name,
        diocese: {
          connect: {
            id: dioceseId
          }
        }
      }
    })
    
    console.log('Admin Regions API: Created region:', region)
    
    return NextResponse.json(region)
  } catch (error) {
    console.error('Error creating region:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 