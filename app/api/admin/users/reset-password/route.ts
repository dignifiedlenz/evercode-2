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
      console.log('No session found in reset-password API')
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
    
    return { authorized: true, session }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, error: 'Authentication error' }
  }
}

export async function POST(request: Request) {
  try {
    console.log('Admin Reset Password API: POST request received')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { authorized, error } = await verifyAdmin(supabase)
    if (!authorized) {
      return NextResponse.json({ error }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
    }
    
    // Find user by email to get auth_id
    const user = await prisma.user.findUnique({
      where: { email },
      select: { auth_id: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.auth_id,
      { password }
    )
    
    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }
    
    console.log('Admin Reset Password API: Password updated for user with email:', email)
    
    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 