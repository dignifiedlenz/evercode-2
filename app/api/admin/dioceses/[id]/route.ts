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
    if (user.role !== UserRole.ROOT_ADMIN && 
        user.role !== UserRole.SUPER_ADMIN) {
      return { authorized: false, error: 'Insufficient permissions' }
    }
    
    return { authorized: true, session }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, error: 'Authentication error' }
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    console.log('Dioceses API: DELETE request received for diocese:', params.id)
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Check if diocese exists
    const diocese = await prisma.diocese.findUnique({
      where: { id: params.id },
      include: { regions: true }
    })
    
    if (!diocese) {
      return NextResponse.json({ error: 'Diocese not found' }, { status: 404 })
    }
    
    // Check if the diocese has regions
    if (diocese.regions.length > 0) {
      // Get all groups in the regions
      const regions = await prisma.region.findMany({
        where: { dioceseId: params.id },
        include: { groups: true }
      })
      
      // Collect all group IDs and region IDs
      const regionIds = regions.map(region => region.id)
      const groupIds = regions.flatMap(region => region.groups.map(group => group.id))
      
      // Transaction to delete all related data
      await prisma.$transaction(async (tx) => {
        // Update users to remove them from groups
        if (groupIds.length > 0) {
          await tx.user.updateMany({
            where: { groupId: { in: groupIds } },
            data: { groupId: null }
          })
        }
        
        // Delete groups
        if (groupIds.length > 0) {
          await tx.group.deleteMany({
            where: { id: { in: groupIds } }
          })
        }
        
        // Delete regions
        if (regionIds.length > 0) {
          await tx.region.deleteMany({
            where: { id: { in: regionIds } }
          })
        }
        
        // Delete the diocese
        await tx.diocese.delete({
          where: { id: params.id }
        })
      })
    } else {
      // If no regions, just delete the diocese
      await prisma.diocese.delete({
        where: { id: params.id }
      })
    }
    
    console.log('Dioceses API: Deleted diocese:', params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting diocese:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 