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
      console.log('No session found in assign-manager API')
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
      return { authorized: false, error: 'Insufficient permissions: Only ROOT_ADMIN and SUPER_ADMIN can assign managers' }
    }
    
    return { authorized: true, session }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, error: 'Authentication error' }
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Assign Manager API: POST request received')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { entityType, entityId, userId, removeManager } = body
    
    if (!entityType || !entityId || (!userId && !removeManager)) {
      return NextResponse.json({ 
        error: 'Entity type, entity ID, and either userId or removeManager flag are required' 
      }, { status: 400 })
    }
    
    if (!['diocese', 'region', 'group'].includes(entityType)) {
      return NextResponse.json({ 
        error: 'Entity type must be one of: diocese, region, group' 
      }, { status: 400 })
    }
    
    // If we're assigning a manager (not removing), verify the user exists and update their role
    let user = null
    if (!removeManager && userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Determine the appropriate role based on entity type
      let newRole
      switch (entityType) {
        case 'diocese':
          newRole = UserRole.SUPER_ADMIN
          break
        case 'region':
          newRole = UserRole.REGIONAL_ADMIN
          break
        case 'group':
          newRole = UserRole.LOCAL_ADMIN
          break
      }
      
      // Update user role if needed
      if (user.role !== newRole) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: newRole }
        })
        console.log(`Updated user ${userId} role to ${newRole}`)
      }
    }
    
    // Update the entity with the new manager or remove the manager
    let result
    if (entityType === 'diocese') {
      // Check if diocese exists
      const diocese = await prisma.diocese.findUnique({
        where: { id: entityId }
      })
      
      if (!diocese) {
        return NextResponse.json({ error: 'Diocese not found' }, { status: 404 })
      }
      
      result = await prisma.diocese.update({
        where: { id: entityId },
        data: { 
          managerId: removeManager ? null : userId 
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    } 
    else if (entityType === 'region') {
      // Check if region exists
      const region = await prisma.region.findUnique({
        where: { id: entityId }
      })
      
      if (!region) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      
      result = await prisma.region.update({
        where: { id: entityId },
        data: { 
          managerId: removeManager ? null : userId 
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    } 
    else if (entityType === 'group') {
      // Check if group exists
      const group = await prisma.group.findUnique({
        where: { id: entityId }
      })
      
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      
      result = await prisma.group.update({
        where: { id: entityId },
        data: { 
          managerId: removeManager ? null : userId 
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    }
    
    console.log(`Admin Assign Manager API: ${removeManager ? 'Removed manager from' : 'Assigned manager to'} ${entityType}:`, result)
    
    return NextResponse.json({
      message: `Manager ${removeManager ? 'removed from' : 'assigned to'} ${entityType} successfully`,
      data: result
    })
  } catch (error) {
    console.error('Error assigning manager:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 