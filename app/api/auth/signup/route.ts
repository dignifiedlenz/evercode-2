import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Add a simple GET method for testing
export async function GET() {
  return new NextResponse(
    JSON.stringify({ message: 'Signup API route is accessible' }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    console.log('API route reached successfully')
    
    // Parse request body
    let body;
    try {
      const rawBody = await request.text()
      console.log('Raw request body:', rawBody)
      body = JSON.parse(rawBody)
      console.log('Parsed request body:', body)
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    const { userId, email, firstName, lastName } = body

    // Validate required fields
    if (!userId || !email || !firstName || !lastName) {
      console.log('Missing required fields:', { userId, email, firstName, lastName })
      return new NextResponse(
        JSON.stringify({ error: 'User ID, email, first name, and last name are required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }

    console.log('Creating user in database with:', {
      auth_id: userId,
      email,
      firstName,
      lastName
    })

    try {
      // Create user in Prisma database
      const user = await prisma.user.create({
        data: {
          auth_id: userId,
          email,
          firstName,
          lastName,
        }
      })
      console.log('User created successfully:', user)
      
      return new NextResponse(
        JSON.stringify(user),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    } catch (prismaError) {
      console.error('Prisma error details:', prismaError)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error', 
          details: prismaError instanceof Error ? prismaError.message : 'Unknown database error' 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      )
    }
  } catch (error) {
    console.error('Error in signup process:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
} 