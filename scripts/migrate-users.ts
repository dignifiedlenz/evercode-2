import { prisma } from '../lib/prisma'
import { supabase } from '../lib/supabase'

async function migrateUsers() {
  try {
    // Get all existing users
    const users = await prisma.user.findMany({
      include: {
        progress: {
          include: {
            unitProgress: true,
            quizProgress: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users to migrate`)

    for (const user of users) {
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          }
        })

        if (authError) {
          console.error(`Error creating auth user for ${user.email}:`, authError)
          continue
        }

        // Update the user in our database with the Supabase auth_id
        await prisma.user.update({
          where: { id: user.id },
          data: {
            auth_id: authData.user.id
          }
        })

        console.log(`Successfully migrated user ${user.email}`)
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error)
      }
    }

    console.log('Migration completed')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateUsers() 