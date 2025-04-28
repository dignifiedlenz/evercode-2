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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Diocese Admin Assignment API: PATCH request received for diocese:', params.id)
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { adminId } = body
    
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
    }
    
    // Check if diocese exists
    const diocese = await prisma.diocese.findUnique({
      where: { id: params.id }
    })
    
    if (!diocese) {
      return NextResponse.json({ error: 'Diocese not found' }, { status: 404 })
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: adminId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Update the user's role to SUPER_ADMIN if not already
    if (user.role !== UserRole.ROOT_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      await prisma.user.update({
        where: { id: adminId },
        data: { role: UserRole.SUPER_ADMIN }
      })
      console.log(`Diocese Admin Assignment API: Updated user ${adminId} to SUPER_ADMIN role`)
    }
    
    // Assign the user as manager of the diocese
    const updatedDiocese = await prisma.diocese.update({
      where: { id: params.id },
      data: { managerId: adminId },
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
    
    console.log('Diocese Admin Assignment API: Assigned admin to diocese:', updatedDiocese)
    
    return NextResponse.json(updatedDiocese)
  } catch (error) {
    console.error('Error assigning admin to diocese:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 