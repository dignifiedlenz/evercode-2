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
      console.log('No session found in user move API')
      return { authorized: false, error: 'Unauthorized' }
    }
    
    // Look up user to check role
    const user = await prisma.user.findUnique({
      where: { auth_id: session.user.id },
      select: { id: true, role: true }
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

export async function POST(request: Request) {
  try {
    console.log('Admin Move User API: POST request received')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error, user: adminUser } = await verifyAdmin(supabase)
    if (!authorized || !adminUser) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { userId, groupId } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Find the user to move
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        group: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify admin permissions based on role
    if (adminUser.role === UserRole.LOCAL_ADMIN) {
      // Local admins can only move users within their managed group
      const adminManagedGroups = await prisma.group.findMany({
        where: { 
          managers: {
            some: {
              id: adminUser.id
            }
          }
        }
      })
      
      if (!adminManagedGroups.some(g => g.id === user.groupId)) {
        return NextResponse.json({ 
          error: 'You do not have permission to move users from this group' 
        }, { status: 403 })
      }
      
      if (groupId && !adminManagedGroups.some(g => g.id === groupId)) {
        return NextResponse.json({ 
          error: 'You do not have permission to move users to this group' 
        }, { status: 403 })
      }
    } else if (adminUser.role === UserRole.REGIONAL_ADMIN) {
      // Regional admins can only move users within their managed regions
      const adminManagedRegions = await prisma.region.findMany({
        where: { 
          managers: {
            some: {
              id: adminUser.id
            }
          }
        },
        include: { groups: true }
      })
      
      const managedGroupIds = adminManagedRegions.flatMap(r => r.groups.map(g => g.id))
      
      if (user.groupId && !managedGroupIds.includes(user.groupId)) {
        return NextResponse.json({ 
          error: 'You do not have permission to move users from this group' 
        }, { status: 403 })
      }
      
      if (groupId && !managedGroupIds.includes(groupId)) {
        return NextResponse.json({ 
          error: 'You do not have permission to move users to this group' 
        }, { status: 403 })
      }
    }
    
    // If groupId is null, remove user from group
    if (!groupId) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          group: { disconnect: true }
        }
      })
      
      console.log(`Admin Move User API: Removed user ${userId} from group ${user.groupId}`)
      
      return NextResponse.json({
        message: 'User removed from group successfully',
        data: updatedUser
      })
    }
    
    // Check if target group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }
    
    // Move user to new group
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        group: {
          connect: { id: groupId }
        }
      },
      include: {
        group: true
      }
    })
    
    console.log(`Admin Move User API: Moved user ${userId} to group ${groupId}`)
    
    return NextResponse.json({
      message: 'User moved to group successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Error moving user:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 